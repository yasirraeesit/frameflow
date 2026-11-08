import { PrismaClient, RenderJob } from '@frameflow/database';
import { ExportPreset, TimelineDocument } from '@frameflow/shared';
import { getRenderQueue } from '../../queues/render.queue.js';
import { S3_BUCKETS } from '../../plugins/s3.js';

export class RendersService {
  constructor(private prisma: PrismaClient) {}

  private async verifyProjectAccess(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    return project;
  }

  private formatRenderJob(job: RenderJob) {
    const s3Endpoint = process.env.S3_ENDPOINT || 'http://localhost:9000';
    const downloadUrl = job.outputS3Key
      ? `${s3Endpoint}/${S3_BUCKETS.RENDERS}/${job.outputS3Key}`
      : null;

    return {
      id: job.id,
      projectId: job.projectId,
      preset: job.preset,
      status: job.status,
      progress: job.progress,
      outputS3Key: job.outputS3Key,
      downloadUrl,
      errorMessage: job.errorMessage,
      createdAt: job.createdAt.toISOString(),
      completedAt: job.completedAt ? job.completedAt.toISOString() : null,
    };
  }

  async create(userId: string, projectId: string, preset: ExportPreset) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });
    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');

    const timelineData = timeline.data as unknown as TimelineDocument;
    if (!timelineData || !Array.isArray(timelineData.tracks)) {
      throw new Error('INVALID_TIMELINE_DOCUMENT');
    }

    // Create RenderJob record in PostgreSQL
    const renderJob = await this.prisma.renderJob.create({
      data: {
        projectId,
        preset,
        status: 'QUEUED',
        progress: 0,
      },
    });

    // Enqueue job into BullMQ
    const queue = getRenderQueue();
    await queue.add(
      'render-export',
      {
        renderJobId: renderJob.id,
        projectId,
        preset,
      },
      {
        jobId: `render-${renderJob.id}`,
      }
    );

    return this.formatRenderJob(renderJob);
  }

  async list(userId: string, projectId: string) {
    await this.verifyProjectAccess(userId, projectId);

    const jobs = await this.prisma.renderJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return jobs.map((job) => this.formatRenderJob(job));
  }

  async getById(userId: string, projectId: string, renderJobId: string) {
    await this.verifyProjectAccess(userId, projectId);

    const job = await this.prisma.renderJob.findFirst({
      where: { id: renderJobId, projectId },
    });
    if (!job) throw new Error('RENDER_JOB_NOT_FOUND');

    return this.formatRenderJob(job);
  }

  async cancel(userId: string, projectId: string, renderJobId: string) {
    await this.verifyProjectAccess(userId, projectId);

    const job = await this.prisma.renderJob.findFirst({
      where: { id: renderJobId, projectId },
    });
    if (!job) throw new Error('RENDER_JOB_NOT_FOUND');

    if (job.status === 'COMPLETED' || job.status === 'FAILED') {
      return this.formatRenderJob(job); // Cannot cancel finished job
    }

    // Update DB status to CANCELLED
    const updated = await this.prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: 'CANCELLED',
      },
    });

    // Attempt to remove from queue if not yet picked up
    try {
      const queue = getRenderQueue();
      const bullJob = await queue.getJob(`render-${renderJobId}`);
      if (bullJob) {
        await bullJob.remove();
      }
    } catch {
      // Ignore queue removal error
    }

    return this.formatRenderJob(updated);
  }
}
