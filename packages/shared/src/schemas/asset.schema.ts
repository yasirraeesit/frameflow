import { z } from 'zod';
import { AssetStatusEnum } from '../events/job.events.js';

export const InitUploadInputSchema = z.object({
  filename: z.string().min(1),
  mimeType: z.string().min(1),
  sizeBytes: z.number().int().positive(),
});

export type InitUploadInput = z.infer<typeof InitUploadInputSchema>;

export const InitUploadResponseSchema = z.object({
  uploadId: z.string(),
  key: z.string(),
  partSize: z.number().int().positive(),
});

export type InitUploadResponse = z.infer<typeof InitUploadResponseSchema>;

export const CompleteUploadInputSchema = z.object({
  uploadId: z.string(),
  key: z.string(),
  filename: z.string(),
  mimeType: z.string(),
  sizeBytes: z.number().int().positive(),
  parts: z.array(
    z.object({
      partNumber: z.number().int().positive(),
      etag: z.string(),
    })
  ),
});

export type CompleteUploadInput = z.infer<typeof CompleteUploadInputSchema>;

export const AssetResponseSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  originalName: z.string(),
  s3Key: z.string(),
  mimeType: z.string(),
  sizeBytes: z.string(), // serialized BigInt
  duration: z.number().nullable().optional(),
  width: z.number().nullable().optional(),
  height: z.number().nullable().optional(),
  fps: z.number().nullable().optional(),
  videoCodec: z.string().nullable().optional(),
  audioCodec: z.string().nullable().optional(),
  proxyKey: z.string().nullable().optional(),
  thumbnailSpriteKey: z.string().nullable().optional(),
  status: AssetStatusEnum,
  errorMessage: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type AssetResponse = z.infer<typeof AssetResponseSchema>;
