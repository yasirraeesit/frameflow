import { z } from 'zod';
import { AspectRatioSchema, CaptionConfigSchema, ReframeConfigSchema, TimelineDocumentSchema } from '../timeline/schema.js';

export const ClipStatusSchema = z.enum([
  'DRAFT',
  'GENERATING',
  'GENERATED',
  'RENDERING',
  'READY',
  'FAILED',
]);
export type ClipStatus = z.infer<typeof ClipStatusSchema>;

export const ViralityBreakdownSchema = z.object({
  hook: z.number().min(0).max(100),
  flow: z.number().min(0).max(100),
  topicRelevance: z.number().min(0).max(100),
  reasoning: z.string().optional(),
});
export type ViralityBreakdown = z.infer<typeof ViralityBreakdownSchema>;

export const SocialPackSchema = z.object({
  title: z.string(),
  caption: z.string(),
  hashtags: z.array(z.string()),
});
export type SocialPack = z.infer<typeof SocialPackSchema>;

export const GeneratedClipSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  title: z.string().min(1),
  hookSummary: z.string().nullable().optional(),
  viralityScore: z.number().int().min(0).max(99),
  scoreBreakdown: ViralityBreakdownSchema.nullable().optional(),
  startTime: z.number().min(0),
  endTime: z.number().positive(),
  duration: z.number().positive(),
  aspectRatio: AspectRatioSchema.default('9:16'),
  captionStyle: CaptionConfigSchema.nullable().optional(),
  reframeMode: z.string().default('auto'),
  reframeConfig: ReframeConfigSchema.nullable().optional(),
  timelineDocument: TimelineDocumentSchema,
  socialPack: SocialPackSchema.nullable().optional(),
  status: ClipStatusSchema.default('GENERATED'),
  renderedS3Key: z.string().nullable().optional(),
  renderedUrl: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GeneratedClipResponse = z.infer<typeof GeneratedClipSchema>;

export const GenerateClipsInputSchema = z.object({
  prompt: z.string().optional(),
  targetLength: z.enum(['<30s', '30-60s', '60-90s']).optional().default('30-60s'),
  targetAspect: AspectRatioSchema.optional().default('9:16'),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal']).optional().default('hormozi_pop'),
});
export type GenerateClipsInput = z.infer<typeof GenerateClipsInputSchema>;

export const UpdateClipInputSchema = z.object({
  title: z.string().min(1).optional(),
  aspectRatio: AspectRatioSchema.optional(),
  reframeMode: z.enum(['auto', 'split', 'manual']).optional(),
  reframeConfig: ReframeConfigSchema.optional(),
  captionStyle: CaptionConfigSchema.optional(),
});
export type UpdateClipInput = z.infer<typeof UpdateClipInputSchema>;
