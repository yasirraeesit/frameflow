import { FastifyPluginAsync } from 'fastify';
import { CreateProjectInputSchema, UpdateProjectInputSchema } from '@frameflow/shared';
import { ProjectsService } from './projects.service.js';

export const projectsRoutes: FastifyPluginAsync = async (server) => {
  const projectsService = new ProjectsService(server.prisma);

  // All project routes require authentication
  server.addHook('preHandler', server.authenticate);

  server.post('/', async (request, reply) => {
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

