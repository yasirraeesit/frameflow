import { z } from 'zod';
import { AspectRatioSchema } from '../timeline/schema.js';

export const CreateProjectInputSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().max(500).optional(),
  sourceVideoUrl: z.string().url().optional(),
  targetAspect: AspectRatioSchema.optional().default('9:16'),
  targetLength: z.enum(['<30s', '30-60s', '60-90s']).optional().default('30-60s'),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal', 'vice_neon']).optional().default('hormozi_pop'),
  prompt: z.string().optional(),
  width: z.number().int().positive().default(1080),
  height: z.number().int().positive().default(1920),
  fps: z.number().positive().default(30.0),
});

export type CreateProjectInput = z.infer<typeof CreateProjectInputSchema>;

export const UpdateProjectInputSchema = CreateProjectInputSchema.partial();

export type UpdateProjectInput = z.infer<typeof UpdateProjectInputSchema>;

export const ProjectResponseSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  description: z.string().nullable().optional(),
  ownerId: z.string().uuid(),
  status: z.enum(['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED', 'PROCESSED']).default('QUEUED'),
  stage: z.string().nullable().optional(),
  progressPercent: z.number().int().min(0).max(100).optional(),
  errorMessage: z.string().nullable().optional(),
  sourceVideoUrl: z.string().nullable().optional(),
  sourceUrl: z.string().nullable().optional(),
  sourceKey: z.string().nullable().optional(),
  durationSeconds: z.number().nullable().optional(),
  contentMode: z.enum(['talking_head', 'gaming']).optional(),
  sourceType: z.enum(['original', 'commentary']).optional(),
  targetAspect: z.string().default('9:16'),
  targetLength: z.string().default('30-60s'),
  transcript: z.unknown().nullable().optional(),
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;

export const IngestProjectInputSchema = z.object({
  title: z.string().min(1).default('Untitled Project'),
  youtubeUrl: z.string().url().optional(),
  storageKey: z.string().optional(),
  contentMode: z.enum(['talking_head', 'gaming']).optional(),
  sourceType: z.enum(['original', 'commentary']).optional(),
  layoutMode: z.enum(['solo', 'split', 'screen_cam', 'gameplay_cam', 'gameplay_full', 'auto']).optional().default('auto'),
  timeframeStart: z.string().optional().default('00:00:00'),
  timeframeEnd: z.string().optional(),
  estimatedDurationSec: z.number().positive().optional().default(300),
  preferredLength: z.enum(['Auto', '<30s', '30–60s', '60–90s', '30-60s', '60-90s']).optional().default('30-60s'),
  captionPreset: z.enum([
    'hormozi_pop',
    'keyword_highlight',
    'karaoke_box',
    'clean_minimal',
    'vice_neon',
    'Hormozi Pop',
    'Karaoke Glow',
    'Clean Cinema',
    'Minimal Top',
    'Vice Neon',
  ]).optional().default('hormozi_pop'),
  aiFocusPrompt: z.string().optional(),
});
export type IngestProjectInput = z.infer<typeof IngestProjectInputSchema>;

export const ClipExportInputSchema = z.object({
  format: z.enum(['mp4_1080p', 'mp4_4k', 'fcpxml_premiere', 'fcpxml_davinci', 'subtitles_srt', 'subtitles_vtt', 'transcript_txt']).default('mp4_1080p'),
  includeWatermark: z.boolean().optional(),
});
export type ClipExportInput = z.infer<typeof ClipExportInputSchema>;
