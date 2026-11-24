import { FastifyPluginAsync } from 'fastify';
import { ClipExportInputSchema } from '@frameflow/shared';
import { ProjectsService } from './projects.service.js';

export const clipsRoutes: FastifyPluginAsync = async (server) => {
  const projectsService = new ProjectsService(server.prisma);
  server.addHook('preHandler', server.authenticate);

  /**
   * PATCH /api/clips/:clipId
   * Updates AST timeline edits, transcript cuts, or title for a generated clip.
   */
  server.patch('/:clipId', async (request, reply) => {
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
   * POST /api/clips/:clipId/export
   * Enqueues an export job on clip-export-queue.
   */
  server.post('/:clipId/export', async (request, reply) => {
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
};
