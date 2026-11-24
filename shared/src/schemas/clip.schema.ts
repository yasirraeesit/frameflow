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
  commentaryHookScript: z.string().nullable().optional(),
  sourceType: z.enum(['original', 'commentary']).optional(),
  monetizationStatus: z.enum(['ready', 'needs_voiceover', 'transformative_applied']).optional(),
  status: ClipStatusSchema.default('GENERATED'),
  renderedS3Key: z.string().nullable().optional(),
  renderedUrl: z.string().nullable().optional(),
  wasExported: z.boolean().optional(),
  userRating: z.number().int().nullable().optional(),
  trimmedStartDeltaSec: z.number().optional(),
  trimmedEndDeltaSec: z.number().optional(),
  finalLayoutMode: z.string().nullable().optional(),
  finalCaptionPreset: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type GeneratedClipResponse = z.infer<typeof GeneratedClipSchema>;

export const ClipFeedbackInputSchema = z.object({
  rating: z.union([z.literal(1), z.literal(-1), z.literal(0), z.null()]),
});
export type ClipFeedbackInput = z.infer<typeof ClipFeedbackInputSchema>;

export const GenerateClipsInputSchema = z.object({
  prompt: z.string().optional(),
  targetLength: z.enum(['<30s', '30-60s', '60-90s']).optional().default('30-60s'),
  targetAspect: AspectRatioSchema.optional().default('9:16'),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal', 'vice_neon']).optional().default('hormozi_pop'),
});
export type GenerateClipsInput = z.infer<typeof GenerateClipsInputSchema>;

export const UpdateClipInputSchema = z.object({
  title: z.string().min(1).optional(),
  aspectRatio: AspectRatioSchema.optional(),
  reframeMode: z.enum(['auto', 'split', 'manual', 'gameplay_cam', 'gameplay_full']).optional(),
  reframeConfig: ReframeConfigSchema.optional(),
  captionStyle: CaptionConfigSchema.optional(),
});
export type UpdateClipInput = z.infer<typeof UpdateClipInputSchema>;

export const GeneratedClipDTOSchema = z.object({
  id: z.string(),
  projectId: z.string(),
  title: z.string(),
  viralityScore: z.number(),
  scoreBreakdown: z.object({
    hook: z.number(),
    flow: z.number(),
    engagement: z.number(),
    clarity: z.number(),
  }),
  aiInsight: z.string(),
  startTime: z.number(),
  endTime: z.number(),
  layoutMode: z.enum(['solo', 'split', 'screen_cam', 'gameplay_cam', 'gameplay_full']),
  socialCopy: z.object({
    tiktok: z.string(),
    reels: z.string(),
    shorts: z.string(),
  }),
  commentaryHookScript: z.string().nullable().optional(),
  sourceType: z.enum(['original', 'commentary']).optional(),
  monetizationStatus: z.enum(['ready', 'needs_voiceover', 'transformative_applied']).optional(),
  timelineAst: TimelineDocumentSchema,
  outputUrl: z.string().nullable().optional(),
});
export type GeneratedClipDTO = z.infer<typeof GeneratedClipDTOSchema>;
