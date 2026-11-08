import { z } from 'zod';

export const ExportPresetSchema = z.enum(['1080p_h264', '720p_h264']);
export type ExportPreset = z.infer<typeof ExportPresetSchema>;

export const RenderStatusSchema = z.enum([
  'QUEUED',
  'RENDERING',
  'COMPLETED',
  'FAILED',
  'CANCELLED',
]);
export type RenderStatus = z.infer<typeof RenderStatusSchema>;

export const CreateRenderInputSchema = z.object({
  preset: ExportPresetSchema.default('1080p_h264'),
});
export type CreateRenderInput = z.infer<typeof CreateRenderInputSchema>;

export const RenderJobResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  preset: z.string(),
  status: RenderStatusSchema,
  progress: z.number().int().min(0).max(100),
  outputS3Key: z.string().nullable().optional(),
  downloadUrl: z.string().nullable().optional(),
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string(),
  completedAt: z.string().nullable().optional(),
});
export type RenderJobResponse = z.infer<typeof RenderJobResponseSchema>;
