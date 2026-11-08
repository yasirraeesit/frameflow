import { FastifyPluginAsync } from 'fastify';
import { TimelineService } from './timeline.service.js';

export const timelineRoutes: FastifyPluginAsync = async (server) => {
  const timelineService = new TimelineService(server.prisma);

  // All timeline routes require authentication
  server.addHook('preHandler', server.authenticate);

  // GET /api/projects/:projectId/timeline
  server.get('/:projectId/timeline', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    try {
      const timeline = await timelineService.getTimeline(request.user.id, projectId);
      return reply.send({ timeline });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND') {
        return reply.status(404).send({ error: 'Timeline not found' });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // PUT /api/projects/:projectId/timeline (autosave)
  server.put('/:projectId/timeline', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = request.body as { data?: unknown };

    if (!body || !body.data) {
      return reply.status(400).send({ error: 'Missing timeline data' });
    }

    try {
      const timeline = await timelineService.updateTimeline(
        request.user.id,
        projectId,
        body.data as import('@frameflow/database').Prisma.InputJsonValue
      );
      return reply.send({ timeline });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND') {
        return reply.status(404).send({ error: 'Timeline not found' });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/projects/:projectId/timeline/versions (snapshot)
  server.post('/:projectId/timeline/versions', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const body = (request.body || {}) as { description?: string };
    const description = body.description || 'Snapshot';

    try {
      const version = await timelineService.createVersion(
        request.user.id,
        projectId,
        description
      );
      return reply.status(201).send({ version });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND') {
        return reply.status(404).send({ error: 'Timeline not found' });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // GET /api/projects/:projectId/timeline/versions (history)
  server.get('/:projectId/timeline/versions', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    try {
      const versions = await timelineService.listVersions(request.user.id, projectId);
      return reply.send({ versions });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND') {
        return reply.status(404).send({ error: 'Timeline not found' });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });

  // POST /api/projects/:projectId/timeline/versions/:version/restore
  server.post('/:projectId/timeline/versions/:version/restore', async (request, reply) => {
    const { projectId, version } = request.params as { projectId: string; version: string };
    const targetVersion = parseInt(version, 10);

    if (isNaN(targetVersion)) {
      return reply.status(400).send({ error: 'Invalid version number' });
    }

    try {
      const timeline = await timelineService.restoreVersion(
        request.user.id,
        projectId,
        targetVersion
      );
      return reply.send({ timeline });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error';
      if (msg === 'PROJECT_NOT_FOUND' || msg === 'TIMELINE_NOT_FOUND' || msg === 'VERSION_NOT_FOUND') {
        return reply.status(404).send({ error: 'Version not found' });
      }
      return reply.status(500).send({ error: 'Internal server error' });
    }
  });
};

