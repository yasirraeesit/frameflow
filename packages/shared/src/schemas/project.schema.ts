import { z } from 'zod';

export const CreateProjectInputSchema = z.object({
  title: z.string().min(1, 'Project title is required').max(100),
  description: z.string().max(500).optional(),
  width: z.number().int().positive().default(1920),
  height: z.number().int().positive().default(1080),
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
  width: z.number(),
  height: z.number(),
  fps: z.number(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export type ProjectResponse = z.infer<typeof ProjectResponseSchema>;
