import { z } from 'zod';

export const TrackTypeSchema = z.enum(['VIDEO', 'AUDIO', 'TEXT']);

export const AspectRatioSchema = z.enum(['9:16', '1:1', '4:5', '16:9']);

export const TextConfigSchema = z.object({
  text: z.string(),
  fontSize: z.number().positive(),
  color: z.string(),
  position: z.object({
    x: z.number(),
    y: z.number(),
  }),
});

export const WordTimingSchema = z.object({
  word: z.string(),
  start: z.number().min(0),
  end: z.number().min(0),
  confidence: z.number().optional(),
  highlighted: z.boolean().optional(),
});

export const ReframeConfigSchema = z.object({
  cropX: z.number().min(0).max(1).default(0.5),
  cropY: z.number().min(0).max(1).default(0.5),
  scale: z.number().min(0.5).max(5.0).default(1.0),
  mode: z.enum(['auto', 'split', 'manual', 'AUTO_SPEAKER', 'MANUAL']).default('auto'),
  speakerTracking: z.boolean().optional(),
});

export const CaptionStyleSchema = z.object({
  preset: z.enum([
    'hormozi_pop',
    'keyword_highlight',
    'karaoke_box',
    'clean_minimal',
    'HORMOZI',
    'KARAOKE',
    'MINIMAL',
    'NONE',
  ]).default('hormozi_pop'),
  position: z.enum(['bottom', 'center', 'top', 'BOTTOM', 'CENTER', 'TOP']).default('bottom'),
  primaryColor: z.string().default('#FFFFFF'),
  highlightColor: z.string().default('#FBBF24'),
  uppercase: z.boolean().default(true),
  fontSize: z.number().positive().optional().default(48),
});

export const CaptionConfigSchema = CaptionStyleSchema;

export const BrandKitConfigSchema = z.object({
  primaryColor: z.string().default('#FFFFFF'),
  highlightColor: z.string().default('#FBBF24'),
  fontFamily: z.string().default('Inter'),
  captionPreset: z.string().default('HORMOZI'),
  logoUrl: z.string().nullable().optional(),
  logoPosition: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right']).optional().default('top_right'),
  logoScale: z.number().positive().optional().default(0.15),
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
  words: z.array(WordTimingSchema).optional(),
  reframe: z.object({
    cropX: z.number().min(0).max(1),
    cropY: z.number().min(0).max(1),
    scale: z.number().positive(),
  }).optional(),
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

export const ViralClipMetadataSchema = z.object({
  title: z.string().min(1),
  viralityScore: z.number().min(0).max(100),
  hookScore: z.number().min(0).max(100),
  flowScore: z.number().min(0).max(100),
  relevanceScore: z.number().min(0).max(100),
  reason: z.string(),
  socialCaption: z.string(),
  hashtags: z.array(z.string()),
});

export const TimelineDocumentSchema = z.object({
  id: z.string().min(1),
  projectId: z.string().min(1),
  clipId: z.string().optional(),
  version: z.number().int().positive().default(1),
  fps: z.number().positive().default(30.0),
  duration: z.number().min(0).default(0),
  aspectRatio: AspectRatioSchema.optional().default('9:16'),
  reframeConfig: ReframeConfigSchema.optional(),
  captionStyle: CaptionStyleSchema.optional(),
  captionConfig: CaptionConfigSchema.optional(),
  brandKit: BrandKitConfigSchema.optional(),
  tracks: z.array(TrackSchema),
  markers: z.array(MarkerSchema).default([]),
});
