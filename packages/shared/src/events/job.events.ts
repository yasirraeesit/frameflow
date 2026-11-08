import { z } from 'zod';

export const AssetStatusEnum = z.enum(['QUEUED', 'PROCESSING', 'READY', 'FAILED']);
export type AssetStatus = z.infer<typeof AssetStatusEnum>;

export const JobTypeEnum = z.enum([
  'METADATA_EXTRACTION',
  'PROXY_GENERATION',
  'THUMBNAIL_GENERATION',
  'SCENE_ANALYSIS',
  'RENDER_EXPORT',
]);
export type JobType = z.infer<typeof JobTypeEnum>;

export const JobStatusEnum = z.enum(['QUEUED', 'PROCESSING', 'DONE', 'FAILED']);
export type JobStatus = z.infer<typeof JobStatusEnum>;

export const JobProgressEventSchema = z.object({
  jobId: z.string(),
  projectId: z.string(),
  assetId: z.string().optional(),
  renderJobId: z.string().optional(),
  type: JobTypeEnum,
  status: JobStatusEnum,
  progress: z.number().min(0).max(100),
  message: z.string().optional(),
  error: z.string().optional(),
  payload: z.record(z.unknown()).optional(),
  timestamp: z.string().datetime().optional(),
});

export type JobProgressEvent = z.infer<typeof JobProgressEventSchema>;
