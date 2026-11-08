import { FastifyPluginAsync } from 'fastify';
import { RegisterInputSchema, LoginInputSchema } from '@frameflow/shared';
import { AuthService } from './auth.service.js';

export const authRoutes: FastifyPluginAsync = async (server) => {
  const authService = new AuthService(server.prisma);

  server.post('/register', async (request, reply) => {
    const parseResult = RegisterInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parseResult.error.format(),
      });
    }

    try {
      const user = await authService.register(parseResult.data);
      const token = server.jwt.sign({ id: user.id, email: user.email });
      return reply.status(201).send({ token, user });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'EMAIL_EXISTS') {
        return reply.status(409).send({ error: 'Conflict', message: 'Email is already registered' });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.post('/login', async (request, reply) => {
    const parseResult = LoginInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parseResult.error.format(),
      });
    }

    try {
      const user = await authService.login(parseResult.data);
      const token = server.jwt.sign({ id: user.id, email: user.email });
      return reply.status(200).send({ token, user });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INVALID_CREDENTIALS') {
        return reply.status(401).send({ error: 'Unauthorized', message: 'Invalid email or password' });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.get('/me', { preHandler: [server.authenticate] }, async (request, reply) => {
    try {
      const user = await authService.getMe(request.user.id);
      return reply.send({ user });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'USER_NOT_FOUND') {
        return reply.status(404).send({ error: 'User not found' });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
