import { z } from 'zod';

export const TrackTypeSchema = z.enum(['VIDEO', 'AUDIO', 'TEXT']);

export const TextConfigSchema = z.object({
  text: z.string(),
  fontSize: z.number().positive(),
  color: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const ClipSchema = z.object({
  id: z.string().min(1),
  assetId: z.string().nullable(),
  name: z.string().min(1),
  start: z.number().min(0, 'Start time cannot be negative'),
  duration: z.number().positive('Duration must be greater than 0'),
  inPoint: z.number().min(0, 'In-point cannot be negative'),
  outPoint: z.number().min(0, 'Out-point cannot be negative'),
  speed: z.number().positive().default(1.0),
  proxyUrl: z.string().nullable().optional().default(null),
  thumbnailUrl: z.string().nullable().optional().default(null),
  textConfig: TextConfigSchema.nullable().optional().default(null),
});

export const TrackSchema = z.object({
  id: z.string().min(1),
  type: TrackTypeSchema,
  name: z.string().min(1),
  locked: z.boolean().default(false),
  muted: z.boolean().default(false),
  clips: z.array(ClipSchema),
});

export const MarkerSchema = z.object({
  id: z.string().min(1),
  time: z.number().min(0),
  label: z.string(),
  color: z.string().default('#3b82f6'),
});

export const TimelineDocumentSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  version: z.number().int().positive().default(1),
  fps: z.number().positive().default(30.0),
  duration: z.number().min(0).default(0),
  tracks: z.array(TrackSchema),
  markers: z.array(MarkerSchema).default([]),
});
