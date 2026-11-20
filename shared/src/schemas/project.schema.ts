import { z } from 'zod';
import { AspectRatioSchema } from '../timeline/schema.js';

export const CreateProjectInputSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().max(500).optional(),
  sourceVideoUrl: z.string().url().optional(),
  targetAspect: AspectRatioSchema.optional().default('9:16'),
  targetLength: z.enum(['<30s', '30-60s', '60-90s']).optional().default('30-60s'),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal']).optional().default('hormozi_pop'),
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
  sourceVideoUrl: z.string().nullable().optional(),
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
