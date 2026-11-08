import { Queue } from 'bullmq';
import { ExportPreset } from '@frameflow/shared';

export const RENDER_QUEUE_NAME = 'render-jobs';

export interface RenderJobData {
  renderJobId: string;
  projectId: string;
  preset: ExportPreset;
}

let renderQueue: Queue<RenderJobData> | null = null;

export function getRenderQueue(): Queue<RenderJobData> {
  if (!renderQueue) {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    renderQueue = new Queue<RenderJobData>(RENDER_QUEUE_NAME, {
      connection: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port || '6379', 10),
        maxRetriesPerRequest: null,
      },
      defaultJobOptions: {
        attempts: 2,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return renderQueue;
}

export async function closeRenderQueue(): Promise<void> {
  if (renderQueue) {
    await renderQueue.close();
    renderQueue = null;
  }
}
