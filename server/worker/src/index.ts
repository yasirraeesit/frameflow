import { Worker } from 'bullmq';
import { processMediaJob } from './processors/media.processor.js';
import { processRenderJob } from './processors/render.processor.js';
import { processClipGenerationJob } from './processors/clip-generation.processor.js';
import { processClipExportJob } from './processors/clip-export.processor.js';
import { CONFIG } from './config.js';

export function startWorker() {
  const redisUrl = new URL(CONFIG.REDIS_URL);
  const connection = {
    host: redisUrl.hostname,
    port: parseInt(redisUrl.port || '6379', 10),
    maxRetriesPerRequest: null,
  };

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
  return { mediaWorker, renderWorker, clipGenWorker, clipExportWorker };
}

if (process.argv[1]?.endsWith('index.js')) {
  startWorker();
}
