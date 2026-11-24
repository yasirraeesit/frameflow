import fastify, { FastifyInstance } from 'fastify';
import fastifyCors from '@fastify/cors';
import fastifyCookie from '@fastify/cookie';
import fastifyMultipart from '@fastify/multipart';
import fastifyWebsocket from '@fastify/websocket';
import prismaPlugin from './plugins/prisma.js';
import jwtPlugin from './plugins/jwt.js';
import redisPlugin from './plugins/redis.js';
import s3Plugin from './plugins/s3.js';
import { authRoutes } from './modules/auth/auth.routes.js';
import { projectsRoutes } from './modules/projects/projects.routes.js';
import { clipsRoutes } from './modules/projects/clips.routes.js';
import { assetsRoutes } from './modules/assets/assets.routes.js';
import { timelineRoutes } from './modules/timeline/timeline.routes.js';
import { rendersRoutes } from './modules/renders/renders.routes.js';
import { billingRoutes } from './modules/billing/billing.routes.js';
import { paddleWebhookRoutes } from './modules/billing/paddle-webhook.routes.js';
import { contactRoutes } from './modules/contact/contact.routes.js';
import { wsGatewayPlugin } from './ws/ws.gateway.js';

// Global BigInt JSON serialization
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return this.toString();
};

export function buildServer(): FastifyInstance {
  const server = fastify({
    logger: process.env.NODE_ENV !== 'test',
  });

  // Base plugins
  server.register(fastifyCors, {
    origin: true,
    credentials: true,
  });

  server.register(fastifyCookie);

  server.register(fastifyMultipart, {
    limits: {
      fileSize: 100 * 1024 * 1024, // 100MB per chunk
    },
  });

  server.register(fastifyWebsocket);

  // Content type parser for binary chunk uploads
  server.addContentTypeParser('application/octet-stream', (_request, payload, done) => {
    const chunks: Buffer[] = [];
    payload.on('data', (chunk: Buffer) => chunks.push(chunk));
    payload.on('end', () => done(null, Buffer.concat(chunks)));
    payload.on('error', (err) => done(err));
  });

  // Custom infrastructure plugins
  server.register(prismaPlugin);
  server.register(jwtPlugin);
  server.register(redisPlugin);
  server.register(s3Plugin);

  // Health check
  server.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Local storage media fallback
  server.get('/media/:bucket/:key', async (request, reply) => {
    const { bucket, key } = request.params as { bucket: string; key: string };
    const fs = await import('fs');
    const path = await import('path');
    const baseDir = process.env.LOCAL_STORAGE_DIR || '/tmp/frameflow-media';
    const filePath = path.join(baseDir, bucket, key);
    if (!fs.existsSync(filePath)) {
      return reply.status(404).send({ error: 'Media file not found' });
    }
    return reply.send(fs.createReadStream(filePath));
  });

  // Modules
  server.register(authRoutes, { prefix: '/api/auth' });
  server.register(projectsRoutes, { prefix: '/api/projects' });
  server.register(clipsRoutes, { prefix: '/api/clips' });
  server.register(assetsRoutes, { prefix: '/api/projects' });
  server.register(timelineRoutes, { prefix: '/api/projects' });
  server.register(rendersRoutes, { prefix: '/api/projects' });
  server.register(billingRoutes, { prefix: '/api/billing' });
  server.register(paddleWebhookRoutes, { prefix: '/api/webhooks' });
  server.register(contactRoutes, { prefix: '/api/contact' });

  // WebSocket Gateway
  server.register(wsGatewayPlugin);

  return server;
}

export async function startServer() {
  const server = buildServer();
  const port = parseInt(process.env.PORT || '4000', 10);
  const host = process.env.HOST || '0.0.0.0';

  try {
    await server.listen({ port, host });
    console.log(`Server listening on http://${host}:${port}`);

    // Embedded BullMQ worker mode for monolithic container deployment
    if (process.env.ENABLE_EMBEDDED_WORKER === 'true') {
      try {
        const { startWorker } = await import('@frameflow/worker');
        startWorker();
        console.log('[EmbeddedWorker] BullMQ Worker mesh initialized in-process');
      } catch (workerErr) {
        console.error('[EmbeddedWorker] Failed to start embedded worker:', workerErr);
      }
    }
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
}

// Auto-run if executed directly
if (process.argv[1]?.endsWith('server.js')) {
  void startServer();
}
