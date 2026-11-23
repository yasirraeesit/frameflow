import { z } from 'zod';

export const PlanTierSchema = z.enum(['FREE', 'STARTER', 'PRO', 'BUSINESS']);
export type PlanTier = z.infer<typeof PlanTierSchema>;

export const BillingIntervalSchema = z.enum(['monthly', 'annual']);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

export const BillingStatusSchema = z.enum(['active', 'past_due', 'canceled', 'trialing']);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const PlanEntitlementsSchema = z.object({
  removeWatermark: z.boolean(),
  maxBrandTemplates: z.number(),
  xmlExport: z.boolean(),
  aiBRoll: z.boolean(),
});
export type PlanEntitlements = z.infer<typeof PlanEntitlementsSchema>;

export const WorkspaceBillingStateSchema = z.object({
  planTier: PlanTierSchema,
  billingInterval: BillingIntervalSchema,
  creditBalance: z.number(),
  monthlyQuota: z.number(),
  status: BillingStatusSchema,
  currentPeriodEnd: z.string().nullable(),
  entitlements: PlanEntitlementsSchema,
});
export type WorkspaceBillingState = z.infer<typeof WorkspaceBillingStateSchema>;

export const CreditTransactionReasonSchema = z.enum([
  'TRIAL_GRANT',
  'SUBSCRIPTION_RENEWAL',
  'CLIP_GENERATION',
  'REFUND',
]);
export type CreditTransactionReason = z.infer<typeof CreditTransactionReasonSchema>;

export const CreditTransactionDTOSchema = z.object({
  id: z.string(),
  userId: z.string(),
  amount: z.number(),
  reason: CreditTransactionReasonSchema,
  projectId: z.string().nullable().optional(),
  createdAt: z.string(),
});
export type CreditTransactionDTO = z.infer<typeof CreditTransactionDTOSchema>;

export const BillingStatusResponseSchema = z.object({
  billing: WorkspaceBillingStateSchema,
  transactions: z.array(CreditTransactionDTOSchema),
});
export type BillingStatusResponse = z.infer<typeof BillingStatusResponseSchema>;

export const DeductCreditsInputSchema = z.object({
  projectId: z.string().min(1),
  requiredCredits: z.number().int().positive(),
});
export type DeductCreditsInput = z.infer<typeof DeductCreditsInputSchema>;

export const DeductCreditsResponseSchema = z.object({
  success: z.boolean(),
  creditBalance: z.number(),
  transactionId: z.string(),
});
export type DeductCreditsResponse = z.infer<typeof DeductCreditsResponseSchema>;

export const RefundCreditsInputSchema = z.object({
  projectId: z.string().min(1),
  credits: z.number().int().positive(),
  reason: z.string().optional(),
});
export type RefundCreditsInput = z.infer<typeof RefundCreditsInputSchema>;

export const RefundCreditsResponseSchema = z.object({
  success: z.boolean(),
  creditBalance: z.number(),
  transactionId: z.string(),
});
export type RefundCreditsResponse = z.infer<typeof RefundCreditsResponseSchema>;

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  FREE: {
    removeWatermark: false,
    maxBrandTemplates: 1,
    xmlExport: false,
    aiBRoll: false,
  },
  STARTER: {
    removeWatermark: true,
    maxBrandTemplates: 1,
    xmlExport: false,
    aiBRoll: true,
  },
  PRO: {
    removeWatermark: true,
    maxBrandTemplates: 4,
    xmlExport: true,
    aiBRoll: true,
  },
  BUSINESS: {
    removeWatermark: true,
    maxBrandTemplates: 10,
    xmlExport: true,
    aiBRoll: true,
  },
};

export const PLAN_QUOTAS: Record<PlanTier, { monthly: number; annual: number }> = {
  FREE: { monthly: 30, annual: 30 },
  STARTER: { monthly: 150, annual: 1800 },
  PRO: { monthly: 300, annual: 3600 },
  BUSINESS: { monthly: 800, annual: 9600 },
};

export function getPlanEntitlements(tier: PlanTier): PlanEntitlements {
  return PLAN_ENTITLEMENTS[tier] || PLAN_ENTITLEMENTS.FREE;
}

export function getPlanMonthlyQuota(tier: PlanTier, interval: BillingInterval = 'monthly'): number {
  const quota = PLAN_QUOTAS[tier] || PLAN_QUOTAS.FREE;
  return interval === 'annual' ? quota.annual : quota.monthly;
}
