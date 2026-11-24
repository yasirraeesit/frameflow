import { Worker } from 'bullmq';
import { prisma } from '@frameflow/database';
import { processMediaJob } from './processors/media.processor.js';
import { processRenderJob } from './processors/render.processor.js';
import { processClipGenerationJob } from './processors/clip-generation.processor.js';
import { processClipExportJob } from './processors/clip-export.processor.js';
import { CONFIG } from './config.js';

export function parseBullMqConnection(urlStr: string) {
  const url = new URL(urlStr);
  const isTls = url.protocol === 'rediss:';
  return {
    host: url.hostname,
    port: parseInt(url.port || '6379', 10),
    maxRetriesPerRequest: null,
    ...(url.password ? { password: decodeURIComponent(url.password) } : {}),
    ...(url.username && url.username !== 'default' ? { username: decodeURIComponent(url.username) } : {}),
    ...(isTls ? { tls: {} } : {}),
  };
}

export function startWorker() {
  const connection = parseBullMqConnection(CONFIG.REDIS_URL);

  const mediaWorker = new Worker(
    'media-processing',
    async (job) => {
      console.log(`[MediaWorker] Started processing job ${job.id} (Asset: ${job.data.assetId})`);
      await processMediaJob(job);
      console.log(`[MediaWorker] Finished processing job ${job.id}`);
    },
    {
      connection,
      concurrency: 2,
    }
  );

  mediaWorker.on('failed', (job, err) => {
    console.error(`[MediaWorker] Job ${job?.id} failed with error:`, err.message);
  });

  const renderWorker = new Worker(
    'render-jobs',
    async (job) => {
      console.log(`[RenderWorker] Started processing job ${job.id} (RenderJob: ${job.data.renderJobId})`);
      await processRenderJob(job);
      console.log(`[RenderWorker] Finished processing job ${job.id}`);
    },
    {
      connection,
      concurrency: 2,
    }
  );

  renderWorker.on('failed', (job, err) => {
    console.error(`[RenderWorker] Job ${job?.id} failed with error:`, err.message);
  });

  const clipGenWorker = new Worker(
    'clip-generation-queue',
    async (job) => {
      console.log(`[ClipGenWorker] Started processing project ${job.data.projectId} (Job: ${job.id})`);
      await processClipGenerationJob(job);
      console.log(`[ClipGenWorker] Finished processing project ${job.data.projectId}`);
    },
    {
      connection,
      concurrency: 2,
    }
  );

  clipGenWorker.on('failed', (job, err) => {
    console.error(`[ClipGenWorker] Job ${job?.id} for project ${job?.data?.projectId} failed:`, err.message);
  });

  const clipExportWorker = new Worker(
    'clip-export-queue',
    async (job) => {
      console.log(`[ClipExportWorker] Started export for clip ${job.data.clipId} (Format: ${job.data.format})`);
      await processClipExportJob(job);
      console.log(`[ClipExportWorker] Finished export for clip ${job.data.clipId}`);
    },
    {
      connection,
      concurrency: 3,
    }
  );

  clipExportWorker.on('failed', (job, err) => {
    console.error(`[ClipExportWorker] Job ${job?.id} failed:`, err.message);
  });

  console.log('[Worker] Media, Render, Clip Generation, and Clip Export workers active.');
  void runStartupRecoverySweep();
  return { mediaWorker, renderWorker, clipGenWorker, clipExportWorker };
}

/**
 * Startup Recovery Sweep:
 * Recovers any projects stuck in QUEUED or PROCESSING state older than 15 minutes
 * (e.g. from container restarts or deploy interrupts) and refunds credits exactly once.
 */
export async function runStartupRecoverySweep(): Promise<void> {
  try {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const stuckProjects = await prisma.project.findMany({
      where: {
        status: { in: ['QUEUED', 'PROCESSING'] },
        updatedAt: { lte: fifteenMinutesAgo },
      },
    });

    if (stuckProjects.length === 0) {
      console.log('[WorkerRecovery] No abandoned or timed-out projects found on startup.');
      return;
    }

    console.log(`[WorkerRecovery] Found ${stuckProjects.length} stuck projects to recover.`);

    for (const proj of stuckProjects) {
      await prisma.$transaction(async (tx) => {
        const current = await tx.project.findUnique({ where: { id: proj.id } });
        if (!current || current.status === 'COMPLETED' || current.status === 'FAILED') return;

        await tx.project.update({
          where: { id: proj.id },
          data: {
            status: 'FAILED',
            stage: 'FAILED',
            errorMessage: 'Worker pipeline timed out or container restarted. Credits refunded.',
          },
        });

        // Atomic one-time refund guard
        if (!current.refundedAt) {
          await tx.project.update({
            where: { id: proj.id },
            data: { refundedAt: new Date() },
          });

          const creditsToRefund = Math.max(1, Math.ceil((current.durationSeconds || 300) / 60));
          await tx.subscription.update({
            where: { userId: current.ownerId },
            data: { creditBalance: { increment: creditsToRefund } },
          });

          await tx.creditTransaction.create({
            data: {
              userId: current.ownerId,
              amount: creditsToRefund,
              reason: 'REFUND',
              projectId: current.id,
            },
          });
          console.log(`[WorkerRecovery] Refunded ${creditsToRefund} credits for abandoned project ${proj.id}`);
        }
      });
    }
  } catch (err) {
    console.error('[WorkerRecovery] Startup recovery sweep error:', err);
  }
}

if (process.argv[1]?.endsWith('index.js')) {
  startWorker();
}
