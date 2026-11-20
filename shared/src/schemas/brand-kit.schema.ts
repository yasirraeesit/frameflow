import { z } from 'zod';

export const BrandKitSchema = z.object({
  id: z.string().uuid(),
  projectId: z.string().uuid(),
  primaryColor: z.string().default('#FFFFFF'),
  highlightColor: z.string().default('#FBBF24'),
  fontFamily: z.string().default('Inter'),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal']).default('hormozi_pop'),
  captionPosition: z.enum(['bottom', 'center', 'top']).default('bottom'),
  logoUrl: z.string().nullable().optional(),
  logoPosition: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right']).default('top_right'),
  logoScale: z.number().positive().default(0.15),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type BrandKitResponse = z.infer<typeof BrandKitSchema>;

export const UpdateBrandKitInputSchema = z.object({
  primaryColor: z.string().optional(),
  highlightColor: z.string().optional(),
  fontFamily: z.string().optional(),
  captionPreset: z.enum(['hormozi_pop', 'keyword_highlight', 'karaoke_box', 'clean_minimal']).optional(),
  captionPosition: z.enum(['bottom', 'center', 'top']).optional(),
  logoUrl: z.string().nullable().optional(),
  logoPosition: z.enum(['top_left', 'top_right', 'bottom_left', 'bottom_right']).optional(),
  logoScale: z.number().positive().optional(),
});
export type UpdateBrandKitInput = z.infer<typeof UpdateBrandKitInputSchema>;
