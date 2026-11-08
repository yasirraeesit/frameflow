import { Worker } from 'bullmq';
import { processMediaJob } from './processors/media.processor.js';
import { CONFIG } from './config.js';

export function startWorker() {
  const redisUrl = new URL(CONFIG.REDIS_URL);

  const worker = new Worker(
    'media-processing',
    async (job) => {
      console.log(`[Worker] Started processing job ${job.id} (Asset: ${job.data.assetId})`);
      await processMediaJob(job);
      console.log(`[Worker] Finished processing job ${job.id}`);
    },
    {
      connection: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port || '6379', 10),
        maxRetriesPerRequest: null,
      },
      concurrency: 2,
    }
  );

  worker.on('failed', (job, err) => {
    console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
  });

  console.log('[Worker] Media processing worker started and listening on "media-processing" queue...');
  return worker;
}

if (process.argv[1]?.endsWith('index.js')) {
  startWorker();
}

