import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import { prisma, PrismaClient } from '@frameflow/database';

declare module 'fastify' {
  interface FastifyInstance {
    prisma: PrismaClient;
  }
}

const prismaPlugin: FastifyPluginAsync = fp(async (server) => {
  server.decorate('prisma', prisma);

  server.addHook('onClose', async () => {
    await prisma.$disconnect();
  });
});

export default prismaPlugin;

