import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { Redis } from 'ioredis';

declare module 'fastify' {
  interface FastifyInstance {
    redis: Redis;
    redisSub: Redis;
  }
}

const redisPlugin: FastifyPluginAsync = fp(async (server) => {
  const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';
  const redis = new Redis(redisUrl, { maxRetriesPerRequest: null });
  const redisSub = new Redis(redisUrl, { maxRetriesPerRequest: null });

  server.decorate('redis', redis);
  server.decorate('redisSub', redisSub);

  server.addHook('onClose', async () => {
    await redis.quit();
    await redisSub.quit();
  });
});

export default redisPlugin;

