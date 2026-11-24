import { z } from 'zod';

export const PlanTierSchema = z.enum(['FREE', 'PRO', 'MAX', 'BUSINESS']);
export type PlanTier = z.infer<typeof PlanTierSchema>;

export const LegacyPlanTierSchema = z.enum(['FREE', 'STARTER', 'PRO', 'MAX', 'BUSINESS']);
export type LegacyPlanTier = z.infer<typeof LegacyPlanTierSchema>;

export function normalizePlanTier(raw: string | null | undefined): PlanTier {
  if (!raw) return 'FREE';
  const upper = raw.toUpperCase();
  if (upper === 'MAX') return 'MAX';
  if (upper === 'PRO' || upper === 'STARTER') return 'PRO';
  if (upper === 'BUSINESS') return 'BUSINESS';
  return 'FREE';
}

export const BillingIntervalSchema = z.enum(['monthly', 'annual']);
export type BillingInterval = z.infer<typeof BillingIntervalSchema>;

export const BillingStatusSchema = z.enum(['active', 'past_due', 'canceled', 'trialing']);
export type BillingStatus = z.infer<typeof BillingStatusSchema>;

export const PlanEntitlementsSchema = z.object({
  maxResolution: z.enum(['720p', '1080p', '4k']),
  removeWatermark: z.boolean(),
  maxBrandTemplates: z.number(),
  aiBRoll: z.boolean(),
  xmlExport: z.boolean(),
  priorityQueue: z.boolean(),
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

export const BusinessInquiryInputSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Valid work email required'),
  companyOrChannel: z.string().min(1, 'Channel or agency name is required'),
  monthlyVideoVolume: z.string().min(1, 'Monthly video volume selection is required'),
  message: z.string().min(1, 'Workflow notes are required'),
});
export type BusinessInquiryInput = z.infer<typeof BusinessInquiryInputSchema>;

export const PLAN_ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  FREE: {
    maxResolution: '720p',
    removeWatermark: false,
    maxBrandTemplates: 1,
    aiBRoll: false,
    xmlExport: false,
    priorityQueue: false,
  },
  PRO: {
    maxResolution: '1080p',
    removeWatermark: true,
    maxBrandTemplates: 2,
    aiBRoll: false,
    xmlExport: false,
    priorityQueue: false,
  },
  MAX: {
    maxResolution: '1080p',
    removeWatermark: true,
    maxBrandTemplates: 5,
    aiBRoll: true,
    xmlExport: false,
    priorityQueue: true,
  },
  BUSINESS: {
    maxResolution: '4k',
    removeWatermark: true,
    maxBrandTemplates: 99,
    aiBRoll: true,
    xmlExport: true,
    priorityQueue: true,
  },
};

export const PLAN_QUOTAS: Record<PlanTier, { monthly: number; annual: number }> = {
  FREE: { monthly: 30, annual: 30 },
  PRO: { monthly: 120, annual: 1440 },
  MAX: { monthly: 500, annual: 6000 },
  BUSINESS: { monthly: 2000, annual: 24000 },
};

export function getPlanEntitlements(tier: string | PlanTier): PlanEntitlements {
  const normalized = normalizePlanTier(tier);
  return PLAN_ENTITLEMENTS[normalized] || PLAN_ENTITLEMENTS.FREE;
}

export function getPlanMonthlyQuota(tier: string | PlanTier, interval: BillingInterval = 'monthly'): number {
  const normalized = normalizePlanTier(tier);
  const quota = PLAN_QUOTAS[normalized] || PLAN_QUOTAS.FREE;
  return interval === 'annual' ? quota.annual : quota.monthly;
}
