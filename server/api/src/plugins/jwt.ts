import fp from 'fastify-plugin';
import { FastifyPluginAsync, FastifyReply, FastifyRequest } from 'fastify';
import fastifyJwt from '@fastify/jwt';

declare module 'fastify' {
  interface FastifyInstance {
    authenticate: (request: FastifyRequest, reply: FastifyReply) => Promise<void>;
  }
}

declare module '@fastify/jwt' {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
    };
  }
}

const jwtPlugin: FastifyPluginAsync = fp(async (server) => {
  await server.register(fastifyJwt, {
    secret: process.env.JWT_SECRET || 'frameflow-super-secret-jwt-key-2026-production-grade',
  });

  server.decorate('authenticate', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      await request.jwtVerify();
    } catch {
      reply.status(401).send({ error: 'Unauthorized', message: 'Invalid or missing authentication token' });
    }
  });
});

export default jwtPlugin;

