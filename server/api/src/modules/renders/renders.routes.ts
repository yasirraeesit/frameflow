import { FastifyPluginAsync } from 'fastify';
import { CreateRenderInputSchema } from '@frameflow/shared';
import { RendersService } from './renders.service.js';

export const rendersRoutes: FastifyPluginAsync = async (server) => {
  const rendersService = new RendersService(server.prisma);

  // All render endpoints require authentication
  server.addHook('preHandler', server.authenticate);

  // POST /api/projects/:projectId/renders
  server.post('/:projectId/renders', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parse = CreateRenderInputSchema.safeParse(request.body || {});
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    try {
      const renderJob = await rendersService.create(
        request.user.id,
        projectId,
        parse.data.preset
      );
      return reply.status(201).send({ renderJob });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND') {
        return reply.status(404).send({ error: msg });
      }
      return reply.status(500).send({ error: 'Failed to create render job' });
    }
  });

  // GET /api/projects/:projectId/renders
  server.get('/:projectId/renders', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    try {
      const renderJobs = await rendersService.list(request.user.id, projectId);
      return reply.send({ renderJobs });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND') {
        return reply.status(404).send({ error: 'Project not found' });
      }
      return reply.status(500).send({ error: 'Failed to list render jobs' });
    }
  });

  // GET /api/projects/:projectId/renders/:renderJobId
  server.get('/:projectId/renders/:renderJobId', async (request, reply) => {
    const { projectId, renderJobId } = request.params as {
      projectId: string;
      renderJobId: string;
    };
    try {
      const renderJob = await rendersService.getById(
        request.user.id,
        projectId,
        renderJobId
      );
      return reply.send({ renderJob });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'RENDER_JOB_NOT_FOUND') {
        return reply.status(404).send({ error: 'Render job not found' });
      }
      return reply.status(500).send({ error: 'Failed to get render job' });
    }
  });

  // POST /api/projects/:projectId/renders/:renderJobId/cancel
  server.post('/:projectId/renders/:renderJobId/cancel', async (request, reply) => {
    const { projectId, renderJobId } = request.params as {
      projectId: string;
      renderJobId: string;
    };
    try {
      const renderJob = await rendersService.cancel(
        request.user.id,
        projectId,
        renderJobId
      );
      return reply.send({ renderJob });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'RENDER_JOB_NOT_FOUND') {
        return reply.status(404).send({ error: 'Render job not found' });
      }
      return reply.status(500).send({ error: 'Failed to cancel render job' });
    }
  });
};
