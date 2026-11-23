import { FastifyPluginAsync } from 'fastify';
import { BillingService, PaddleWebhookEventPayload } from './billing.service.js';

export const paddleWebhookRoutes: FastifyPluginAsync = async (server) => {
  const billingService = new BillingService(server.prisma);

  /**
   * POST /api/webhooks/paddle
   * Unauthenticated webhook endpoint receiving real-time billing lifecycle events from Paddle.
   * Verifies Paddle-Signature HMAC-SHA256 header against process.env.PADDLE_WEBHOOK_SECRET.
   */
  server.post('/paddle', async (request, reply) => {
    const signatureHeader = request.headers['paddle-signature'] as string | undefined;
    const rawBody = typeof request.body === 'string' ? request.body : JSON.stringify(request.body);
    const payload = (request.body as PaddleWebhookEventPayload) || { event_type: 'unknown', data: {} };

    try {
      const result = await billingService.handlePaddleWebhook(rawBody, signatureHeader, payload);
      return reply.status(200).send(result);
    } catch (err: unknown) {
      if (err instanceof Error && err.message === 'INVALID_SIGNATURE') {
        return reply.status(401).send({
          error: 'Unauthorized',
          message: 'Invalid or missing Paddle webhook signature',
        });
      }
      server.log.error(err);
      return reply.status(500).send({ error: 'Webhook processing failed' });
    }
  });
};
