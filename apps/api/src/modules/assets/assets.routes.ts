import { FastifyPluginAsync } from 'fastify';
import { InitUploadInputSchema, CompleteUploadInputSchema } from '@frameflow/shared';
import { AssetsService } from './assets.service.js';

export const assetsRoutes: FastifyPluginAsync = async (server) => {
  const assetsService = new AssetsService(server.prisma, server.s3);

  // All asset routes require authentication
  server.addHook('preHandler', server.authenticate);

  server.post('/:projectId/assets/upload/init', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parse = InitUploadInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    try {
      const res = await assetsService.initUpload(request.user.id, projectId, parse.data);
      return reply.send(res);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'STORAGE_QUOTA_EXCEEDED') {
        return reply.status(400).send({ error: 'Storage quota exceeded' });
      }
      if (err instanceof Error && err.message === 'PROJECT_NOT_FOUND') {
        return reply.status(404).send({ error: 'Project not found' });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });

  server.put('/:projectId/assets/upload/chunk', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const query = request.query as {
      uploadId?: string;
      key?: string;
      partNumber?: string;
    };

    if (!query.uploadId || !query.key || !query.partNumber) {
      return reply.status(400).send({
        error: 'Missing required query parameters: uploadId, key, partNumber',
      });
    }

    const partNumber = parseInt(query.partNumber, 10);
    if (isNaN(partNumber) || partNumber < 1) {
      return reply.status(400).send({ error: 'Invalid partNumber' });
    }

    // Buffer chunk from request body
    const chunkBuffer = await request.body as Buffer;
    if (!chunkBuffer || !Buffer.isBuffer(chunkBuffer)) {
      return reply.status(400).send({ error: 'Expected binary chunk buffer in request body' });
    }

    try {
      const res = await assetsService.uploadPart(
        request.user.id,
        projectId,
        query.uploadId,
        query.key,
        partNumber,
        chunkBuffer
      );
      return reply.send(res);
    } catch (err: unknown) {
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to upload chunk' });
    }
  });

  server.post('/:projectId/assets/upload/complete', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    const parse = CompleteUploadInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parse.error.format(),
      });
    }

    try {
      const asset = await assetsService.completeUpload(request.user.id, projectId, parse.data);
      return reply.status(201).send({ asset });
    } catch (err: unknown) {
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to complete multipart upload' });
    }
  });

  server.get('/:projectId/assets', async (request, reply) => {
    const { projectId } = request.params as { projectId: string };
    try {
      const assets = await assetsService.list(request.user.id, projectId);
      return reply.send({ assets });
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'PROJECT_NOT_FOUND') {
        return reply.status(404).send({ error: 'Project not found' });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Internal Server Error' });
    }
  });
};
