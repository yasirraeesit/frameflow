import { FastifyPluginAsync } from 'fastify';
import { DeductCreditsInputSchema, RefundCreditsInputSchema } from '@frameflow/shared';
import { BillingService } from './billing.service.js';

export const billingRoutes: FastifyPluginAsync = async (server) => {
  const billingService = new BillingService(server.prisma);

  /**
   * GET /api/billing/status
   * Returns current user's workspace billing state and credit transaction history.
   */
  server.get('/status', { preHandler: [server.authenticate] }, async (request, reply) => {
    try {
      const status = await billingService.getBillingStatus(request.user.id);
      return reply.send(status);
    } catch (err: unknown) {
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to retrieve billing status' });
    }
  });

  /**
   * POST /api/billing/deduct
   * Atomically verifies and deducts credits before video processing begins.
   */
  server.post('/deduct', { preHandler: [server.authenticate] }, async (request, reply) => {
    const parseResult = DeductCreditsInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parseResult.error.format(),
      });
    }

    try {
      const result = await billingService.deductCredits(request.user.id, parseResult.data);
      return reply.send(result);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INSUFFICIENT_CREDITS') {
        return reply.status(402).send({
          error: 'INSUFFICIENT_CREDITS',
          message: 'Insufficient video credits remaining to process this project. Please upgrade your plan or top up.',
        });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to deduct credits' });
    }
  });

  /**
   * POST /api/billing/refund
   * Atomically restores credits if an AI render/clip worker task fails.
   */
  server.post('/refund', { preHandler: [server.authenticate] }, async (request, reply) => {
    const parseResult = RefundCreditsInputSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: 'Validation failed',
        issues: parseResult.error.format(),
      });
    }

    try {
      const result = await billingService.refundCredits(request.user.id, parseResult.data);
      return reply.send(result);
    } catch (err: unknown) {
      server.log.error(err);
      return reply.status(500).send({ error: 'Failed to refund credits' });
    }
  });
};
