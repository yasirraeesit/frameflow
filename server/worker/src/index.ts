import { Worker } from 'bullmq';
import { processMediaJob } from './processors/media.processor.js';
import { processRenderJob } from './processors/render.processor.js';
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

  console.log('[Worker] Media & Render workers started and listening on "media-processing" and "render-jobs" queues...');
  return { mediaWorker, renderWorker };
}

if (process.argv[1]?.endsWith('index.js')) {
  startWorker();
}

