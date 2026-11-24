import { FastifyPluginAsync } from 'fastify';
import { BusinessInquiryInputSchema } from '@frameflow/shared';

export const contactRoutes: FastifyPluginAsync = async (server) => {
  /**
   * POST /api/contact/business
   * Submits a high-volume Business inquiry lead.
   */
  server.post('/business', async (request, reply) => {
    const parse = BusinessInquiryInputSchema.safeParse(request.body);
    if (!parse.success) {
      return reply.status(400).send({
        error: 'VALIDATION_ERROR',
        message: 'Invalid business inquiry form submission',
        issues: parse.error.issues,
      });
    }

    const { name, email, companyOrChannel, monthlyVideoVolume, message } = parse.data;

    const inquiry = await server.prisma.businessInquiry.create({
      data: {
        name,
        email,
        companyOrChannel,
        monthlyVideoVolume,
        message,
      },
    });

    return reply.status(201).send({
      success: true,
      message: 'Business inquiry submitted successfully. Our team will contact you shortly.',
      id: inquiry.id,
    });
  });
};
