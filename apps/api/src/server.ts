import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyMultipart from '@fastify/multipart';
import fastifyWebsocket from '@fastify/websocket';
import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import redisPlugin from './plugins/redis.js';
import s3Plugin from './plugins/s3.js';
import { authRoutes } from './modules/auth/auth.routes.js';

export function buildServer(): FastifyInstance {
  const server = fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  // Base plugins
  server.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  server.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB per chunk
    },
  });

  server.register(fastifyWebsocket);

  // Custom infrastructure plugins
  server.register(prismaPlugin);
  server.register(jwtPlugin);
  server.register(redisPlugin);
  server.register(s3Plugin);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Modules
  server.register(authRoutes, { prefix: '/api/auth' });

  return server;
}

export async function startServer() {
  const server = buildServer();
  const port = parseInt(process.env.PORT || '4000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('server.js')) {
  void startServer();
}
