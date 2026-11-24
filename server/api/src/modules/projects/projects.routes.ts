import { FastifyPluginAsync } from 'fastify';
import {
  CreateProjectInputSchema,
  UpdateProjectInputSchema,
  IngestProjectInputSchema,
  ClipExportInputSchema,
} from '@frameflow/shared';
import { ProjectsService } from './projects.service.js';

export const projectsRoutes: FastifyPluginAsync = async (server) => {
  const projectsService = new ProjectsService(server.prisma);

  // All project routes require authentication
  server.addHook('preHandler', server.authenticate);

  /**
   * POST /api/projects
   * Ingests a new project via YouTube link or uploaded storage key,
   * calculates required credits, deducts them atomically, and enqueues clipping.
   */
  server.post('/', async (request, reply) => {
    const body = request.body as Record<string, unknown>;

    // If youtubeUrl or storageKey or preferredLength is present, route to Ingest pipeline
    if (body.youtubeUrl || body.storageKey || body.aiFocusPrompt || body.captionPreset) {
      const ingestParse = IngestProjectInputSchema.safeParse(body);
      if (!ingestParse.success) {
        return reply.status(400).send({
          error: 'Validation failed',
          issues: ingestParse.error.format(),
        });
      }

      try {
        const result = await projectsService.ingest(request.user.id, ingestParse.data);
        return reply.status(201).send(result);
      } catch (err: unknown) {
        if (err instanceof Error) {
          if (err.message === 'INSUFFICIENT_CREDITS') {
            const creditErr = err as Error & { required?: number; available?: number };
            return reply.status(402).send({
              code: 'INSUFFICIENT_CREDITS',
              message: 'Insufficient video processing credits remaining.',
              required: creditErr.required ?? 5,
              available: creditErr.available ?? 0,
            });
          }

          const userMessage = (err as unknown as { userMessage?: string }).userMessage;
          const preflightErrors = [
            'INVALID_YOUTUBE_URL',
            'LIVE_STREAM_NOT_SUPPORTED',
            'VIDEO_TOO_LONG',
            'VIDEO_UNAVAILABLE',
          ];

          if (userMessage || preflightErrors.includes(err.message)) {
            return reply.status(400).send({
              code: err.message,
              error: userMessage || err.message,
            });
          }
        }
        server.log.error(err);
        return reply.status(500).send({ error: 'Failed to ingest video project' });
      }
    }

    // Standard manual project creation
    const parse = CreateProjectInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    const project = await projectsService.create(request.user.id, parse.data);
    return reply.status(201).send({ project });
  });

  server.get('/', async (request, reply) => {
    const projects = await projectsService.list(request.user.id);
    return reply.send({ projects });
  });

  server.get('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const project = await projectsService.getById(request.user.id, id);
      return reply.send({ project });
    } catch {
      return reply.status(404).send({ error: 'Project not found' });
    }
  });

  /**
   * GET /api/projects/:id/clips
   * Returns all ranked GeneratedClips for this project ordered by viralityScore DESC.
   */
  server.get('/:id/clips', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      const clips = await projectsService.getClips(request.user.id, id);
      return reply.send({ clips });
    } catch {
      return reply.status(404).send({ error: 'Project not found' });
    }
  });

  /**
   * PATCH /api/projects/clips/:clipId (or /api/clips/:clipId)
   * Updates AST edits, layout mode, or title for a generated clip.
   */
  server.patch('/clips/:clipId', async (request, reply) => {
    const { clipId } = request.params as { clipId: string };
    const body = request.body as {
      title?: string;
      layoutMode?: string;
      timelineAstJson?: object;
    };

    try {
      const updated = await projectsService.updateClip(request.user.id, clipId, body);
      return reply.send({ clip: updated });
    } catch {
      return reply.status(404).send({ error: 'Clip not found' });
    }
  });

  /**
   * POST /api/projects/clips/:clipId/export
   * Triggers background rendering of the final MP4 or FCPXML.
   */
  server.post('/clips/:clipId/export', async (request, reply) => {
    const { clipId } = request.params as { clipId: string };
    const parse = ClipExportInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    try {
      const exportJob = await projectsService.exportClip(request.user.id, clipId, parse.data);
      return reply.status(202).send(exportJob);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Export failed';
      if (message.startsWith('UPGRADE_REQUIRED')) {
        return reply.status(403).send({ error: 'UPGRADE_REQUIRED', message });
      }
      return reply.status(404).send({ error: 'Clip not found', message });
    }
  });

  server.patch('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const parse = UpdateProjectInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    try {
      const project = await projectsService.update(request.user.id, id, parse.data);
      return reply.send({ project });
    } catch {
      return reply.status(404).send({ error: 'Project not found' });
    }
  });

  server.delete('/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await projectsService.delete(request.user.id, id);
      return reply.send({ success: true, message: 'Project deleted' });
    } catch {
      return reply.status(404).send({ error: 'Project not found' });
    }
  });
};
