import { initializePaddle, Paddle } from '@paddle/paddle-js';
import type { WorkspaceBillingState, BillingStatusResponse, CreditTransactionDTO } from '@frameflow/shared';

let paddleInstancePromise: Promise<Paddle | undefined> | null = null;

/**
 * Initializes or returns the singleton Paddle.js instance when NEXT_PUBLIC_PADDLE_CLIENT_TOKEN is set.
 */
export async function getPaddle(): Promise<Paddle | undefined> {
  const clientToken = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN;
  if (!clientToken) {
    return undefined;
  }

  if (!paddleInstancePromise) {
    const environment = (process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as 'sandbox' | 'production') || 'sandbox';
    paddleInstancePromise = initializePaddle({
      environment,
      token: clientToken,
    });
  }

  return paddleInstancePromise;
}

export interface CheckoutOptions {
  priceId?: string;
  planName: string;
  interval: 'monthly' | 'annual';
  customerEmail?: string;
  userId?: string;
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * Launches Paddle Checkout.
 * Returns true if native Paddle Checkout overlay was launched, or false if sandbox fallback modal should be displayed.
 */
export async function launchPaddleCheckout(options: CheckoutOptions): Promise<boolean> {
  try {
    const paddle = await getPaddle();
    if (!paddle) {
      return false; // Launch sandbox modal fallback
    }

    const defaultPriceId =
      options.priceId ||
      (options.planName.toLowerCase().includes('max')
        ? options.interval === 'annual'
          ? process.env.NEXT_PUBLIC_PADDLE_MAX_ANNUAL_PRICE_ID || 'pri_max_annual'
          : process.env.NEXT_PUBLIC_PADDLE_MAX_PRICE_ID || 'pri_max_monthly'
        : options.interval === 'annual'
        ? process.env.NEXT_PUBLIC_PADDLE_PRO_ANNUAL_PRICE_ID || 'pri_pro_annual'
        : process.env.NEXT_PUBLIC_PADDLE_PRO_PRICE_ID || 'pri_pro_monthly');

    paddle.Checkout.open({
      items: [{ priceId: defaultPriceId, quantity: 1 }],
      customData: {
        userId: options.userId || 'demo-user-1',
        planName: options.planName,
        interval: options.interval,
      },
      customer: options.customerEmail ? { email: options.customerEmail } : undefined,
      settings: {
        displayMode: 'overlay',
        theme: 'light',
        successUrl: typeof window !== 'undefined' ? `${window.location.origin}/dashboard?payment=success` : undefined,
      },
    });

    return true;
  } catch (err) {
    console.warn('[Paddle] Error initializing native checkout, falling back to sandbox drawer:', err);
    return false;
  }
}

/**
 * Retrieves billing state from the Fastify backend /api/billing/status.
 * Gracefully provides demo data if unauthenticated or in offline demo mode.
 */
export async function fetchBillingStatus(): Promise<BillingStatusResponse> {
  try {
    const token = typeof window !== 'undefined' ? localStorage.getItem('frameflow_token') : null;
    if (!token) {
      return getDemoBillingState();
    }

    const res = await fetch('/api/billing/status', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) {
      return getDemoBillingState();
    }

    const data: BillingStatusResponse = await res.json();
    return data;
  } catch {
    return getDemoBillingState();
  }
}

/**
 * Fallback demo billing state for offline development or trial exploration.
 */
export function getDemoBillingState(): BillingStatusResponse {
  const billing: WorkspaceBillingState = {
    planTier: 'PRO',
    billingInterval: 'monthly',
    creditBalance: 120,
    monthlyQuota: 120,
    status: 'active',
    currentPeriodEnd: new Date(Date.now() + 24 * 86400000).toISOString(),
    entitlements: {
      maxResolution: '1080p',
      removeWatermark: true,
      maxBrandTemplates: 2,
      aiBRoll: false,
      xmlExport: false,
      priorityQueue: false,
    },
  };

  const transactions: CreditTransactionDTO[] = [
    {
      id: 'tx-demo-1',
      userId: 'demo-user-1',
      amount: 120,
      reason: 'SUBSCRIPTION_RENEWAL',
      createdAt: new Date(Date.now() - 6 * 86400000).toISOString(),
    },
    {
      id: 'tx-demo-2',
      userId: 'demo-user-1',
      amount: -8,
      reason: 'CLIP_GENERATION',
      projectId: 'demo-1',
      createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    },
  ];

  return { billing, transactions };
}
