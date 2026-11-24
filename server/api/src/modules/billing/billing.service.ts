import crypto from 'node:crypto';
import { PrismaClient, PlanTier, BillingInterval, SubscriptionStatus } from '@frameflow/database';
import {
  WorkspaceBillingState,
  BillingStatusResponse,
  DeductCreditsInput,
  DeductCreditsResponse,
  RefundCreditsInput,
  RefundCreditsResponse,
  getPlanEntitlements,
  getPlanMonthlyQuota,
  CreditTransactionDTO,
} from '@frameflow/shared';

export interface PaddleWebhookEventPayload {
  event_id?: string;
  event_type: string;
  occurred_at?: string;
  data: {
    id?: string;
    status?: string;
    customer_id?: string;
    custom_data?: {
      userId?: string;
      user_id?: string;
      email?: string;
      [key: string]: unknown;
    };
    customer?: {
      id?: string;
      email?: string;
    };
    items?: Array<{
      price?: {
        id?: string;
        billing_cycle?: {
          interval?: string;
          frequency?: number;
        };
      };
      quantity?: number;
    }>;
    current_billing_period?: {
      ends_at?: string;
      starts_at?: string;
    };
    subscription_id?: string;
    [key: string]: unknown;
  };
}

export class BillingService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Retrieves the current user's workspace billing state and recent credit transactions.
   * If no subscription exists yet, atomically initializes a default FREE tier with 30 trial credits.
   */
  async getBillingStatus(userId: string): Promise<BillingStatusResponse> {
    let sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    if (!sub) {
      sub = await this.prisma.$transaction(async (tx) => {
        const createdSub = await tx.subscription.create({
          data: {
            userId,
            planTier: PlanTier.FREE,
            status: SubscriptionStatus.active,
            billingInterval: BillingInterval.monthly,
            creditBalance: 30,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: 30,
            reason: 'TRIAL_GRANT',
          },
        });

        return createdSub;
      });
    }

    const history = await this.prisma.creditTransaction.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    const billingState: WorkspaceBillingState = {
      planTier: sub.planTier as 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS',
      billingInterval: sub.billingInterval as 'monthly' | 'annual',
      creditBalance: sub.creditBalance,
      monthlyQuota: getPlanMonthlyQuota(sub.planTier, sub.billingInterval),
      status: sub.status as 'active' | 'past_due' | 'canceled' | 'trialing',
      currentPeriodEnd: sub.currentPeriodEnd ? sub.currentPeriodEnd.toISOString() : null,
      entitlements: getPlanEntitlements(sub.planTier),
    };

    const transactions: CreditTransactionDTO[] = history.map((tx) => ({
      id: tx.id,
      userId: tx.userId,
      amount: tx.amount,
      reason: tx.reason,
      projectId: tx.projectId,
      createdAt: tx.createdAt.toISOString(),
    }));

    return {
      billing: billingState,
      transactions,
    };
  }

  /**
   * Atomically verifies that the user has enough credits and deducts them.
   * If credit balance is insufficient, throws an INSUFFICIENT_CREDITS error.
   */
  async deductCredits(userId: string, input: DeductCreditsInput): Promise<DeductCreditsResponse> {
    return await this.prisma.$transaction(async (tx) => {
      let sub = await tx.subscription.findUnique({
        where: { userId },
      });

      if (!sub) {
        sub = await tx.subscription.create({
          data: {
            userId,
            planTier: PlanTier.FREE,
            status: SubscriptionStatus.active,
            billingInterval: BillingInterval.monthly,
            creditBalance: 30,
          },
        });
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: 30,
            reason: 'TRIAL_GRANT',
          },
        });
      }

      if (sub.creditBalance < input.requiredCredits) {
        throw new Error('INSUFFICIENT_CREDITS');
      }

      const updated = await tx.subscription.update({
        where: { userId },
        data: {
          creditBalance: { decrement: input.requiredCredits },
        },
      });

      const txRecord = await tx.creditTransaction.create({
        data: {
          userId,
          amount: -input.requiredCredits,
          reason: 'CLIP_GENERATION',
          projectId: input.projectId,
        },
      });

      return {
        success: true,
        creditBalance: updated.creditBalance,
        transactionId: txRecord.id,
      };
    });
  }

  /**
   * Atomically refunds credits back to the user (e.g. if an AI worker job fails).
   */
  async refundCredits(userId: string, input: RefundCreditsInput): Promise<RefundCreditsResponse> {
    return await this.prisma.$transaction(async (tx) => {
      // Guard against multiple refunds on the same project
      if (input.projectId) {
        const project = await tx.project.findUnique({
          where: { id: input.projectId },
        });
        if (project?.refundedAt) {
          const currentSub = await tx.subscription.findUnique({ where: { userId } });
          return {
            success: true,
            creditBalance: currentSub?.creditBalance ?? 0,
            transactionId: 'already_refunded',
          };
        }
        await tx.project.update({
          where: { id: input.projectId },
          data: { refundedAt: new Date() },
        });
      }

      const updated = await tx.subscription.update({
        where: { userId },
        data: {
          creditBalance: { increment: input.credits },
        },
      });

      const txRecord = await tx.creditTransaction.create({
        data: {
          userId,
          amount: input.credits,
          reason: 'REFUND',
          projectId: input.projectId,
        },
      });

      return {
        success: true,
        creditBalance: updated.creditBalance,
        transactionId: txRecord.id,
      };
    });
  }

  /**
   * Verifies Paddle-Signature HMAC-SHA256 header.
   */
  verifyPaddleSignature(rawBody: string, signatureHeader?: string): boolean {
    const secret = process.env.PADDLE_WEBHOOK_SECRET;

    // In local sandbox / testing without configured secret, allow testing gracefully
    if (!secret || secret === 'test' || secret === 'pdl_test') {
      return true;
    }

    if (!signatureHeader) {
      return false;
    }

    // Format: ts=1680000000;h1=xxxxxxxxxxxxxxxxxxxxxxxx
    const parts = signatureHeader.split(';');
    let ts = '';
    let h1 = '';

    for (const part of parts) {
      const [key, value] = part.trim().split('=');
      if (key === 'ts' && value) ts = value;
      if (key === 'h1' && value) h1 = value;
    }

    if (!ts || !h1) {
      return false;
    }

    const signedPayload = `${ts}:${rawBody}`;
    const calculated = crypto.createHmac('sha256', secret).update(signedPayload).digest('hex');

    try {
      return crypto.timingSafeEqual(Buffer.from(calculated, 'utf8'), Buffer.from(h1, 'utf8'));
    } catch {
      return calculated === h1;
    }
  }

  /**
   * Handles incoming Paddle Billing v2 webhooks.
   * Maps price_id to plan tier & credit quota, updates subscription and records credit transaction.
   */
  async handlePaddleWebhook(
    rawBody: string,
    signatureHeader: string | undefined,
    eventPayload: PaddleWebhookEventPayload
  ): Promise<{ received: boolean; event: string; duplicate?: boolean }> {
    const isValid = this.verifyPaddleSignature(rawBody, signatureHeader);
    if (!isValid) {
      throw new Error('INVALID_SIGNATURE');
    }

    const { event_type, data } = eventPayload;
    if (!event_type || !data) {
      return { received: true, event: 'unknown' };
    }

    // Webhook Idempotency Guard: Safely ignore duplicate deliveries with 200 OK
    const eventId = eventPayload.event_id || (data?.id ? `${event_type}:${data.id}` : null);
    if (eventId) {
      const existing = await this.prisma.webhookEvent.findUnique({
        where: { eventId },
      });
      if (existing) {
        console.log(`[PaddleWebhook] Duplicate webhook delivery ${eventId} safely acknowledged.`);
        return { received: true, event: event_type, duplicate: true };
      }
      await this.prisma.webhookEvent.create({
        data: {
          eventId,
          eventType: event_type,
          processedAt: new Date(),
        },
      });
    }

    // Determine target userId from custom_data or customer email
    let userId: string | null =
      data.custom_data?.userId || data.custom_data?.user_id || null;

    if (!userId && data.customer?.email) {
      const user = await this.prisma.user.findUnique({
        where: { email: data.customer.email },
      });
      if (user) {
        userId = user.id;
      }
    }

    if (!userId) {
      // Cannot match user, log and acknowledge
      return { received: true, event: event_type };
    }

    // Extract item price details
    const firstItem = data.items?.[0];
    const priceId = firstItem?.price?.id || (typeof data.price_id === 'string' ? data.price_id : '');
    const intervalStr = firstItem?.price?.billing_cycle?.interval || '';
    const isAnnual = intervalStr.toLowerCase().includes('year') || priceId.toLowerCase().includes('yr') || priceId.toLowerCase().includes('annual');

    // Map priceId to Plan Tier & Credits
    let planTier: PlanTier = PlanTier.STARTER;
    let creditsToAdd = isAnnual ? 1800 : 150;

    const priceLower = priceId.toLowerCase();
    if (priceLower.includes('pro')) {
      planTier = PlanTier.PRO;
      creditsToAdd = isAnnual ? 3600 : 300;
    } else if (priceLower.includes('business') || priceLower.includes('agency')) {
      planTier = PlanTier.BUSINESS;
      creditsToAdd = isAnnual ? 9600 : 800;
    } else if (priceLower.includes('starter')) {
      planTier = PlanTier.STARTER;
      creditsToAdd = isAnnual ? 1800 : 150;
    }

    const billingInterval: BillingInterval = isAnnual ? BillingInterval.annual : BillingInterval.monthly;
    const currentPeriodEnd = data.current_billing_period?.ends_at
      ? new Date(data.current_billing_period.ends_at)
      : null;

    if (event_type === 'subscription.canceled') {
      await this.prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          planTier: PlanTier.FREE,
          status: SubscriptionStatus.canceled,
          billingInterval,
          paddleCustomerId: data.customer_id || null,
          paddleSubscriptionId: data.id || null,
          paddlePriceId: priceId || null,
          currentPeriodEnd,
        },
        update: {
          status: SubscriptionStatus.canceled,
          currentPeriodEnd,
        },
      });
    } else if (
      event_type === 'transaction.completed' ||
      event_type === 'subscription.created' ||
      event_type === 'subscription.updated' ||
      event_type === 'subscription.activated'
    ) {
      await this.prisma.$transaction(async (tx) => {
        await tx.subscription.upsert({
          where: { userId },
          create: {
            userId,
            planTier,
            status: SubscriptionStatus.active,
            billingInterval,
            paddleCustomerId: data.customer_id || null,
            paddleSubscriptionId: data.subscription_id || data.id || null,
            paddlePriceId: priceId || null,
            creditBalance: creditsToAdd,
            currentPeriodEnd,
          },
          update: {
            planTier,
            status: SubscriptionStatus.active,
            billingInterval,
            paddleCustomerId: data.customer_id || undefined,
            paddleSubscriptionId: data.subscription_id || data.id || undefined,
            paddlePriceId: priceId || undefined,
            creditBalance: { increment: creditsToAdd },
            currentPeriodEnd: currentPeriodEnd || undefined,
          },
        });

        await tx.creditTransaction.create({
          data: {
            userId,
            amount: creditsToAdd,
            reason: 'SUBSCRIPTION_RENEWAL',
          },
        });
      });
    }

    return { received: true, event: event_type };
  }
}
