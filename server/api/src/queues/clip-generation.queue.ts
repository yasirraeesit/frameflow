import { Queue } from 'bullmq';

export const CLIP_GENERATION_QUEUE_NAME = 'clip-generation-queue';

export interface ClipGenerationJobData {
  projectId: string;
  userId: string;
  title: string;
  youtubeUrl?: string;
  storageKey?: string;
  timeframeStart?: string;
  timeframeEnd?: string;
  durationSeconds: number;
  creditsDeducted: number;
  preferredLength?: string;
  captionPreset?: string;
  aiFocusPrompt?: string;
  contentMode?: 'talking_head' | 'gaming';
  sourceType?: 'original' | 'commentary';
  layoutMode?: string;
}

let clipGenerationQueue: Queue<ClipGenerationJobData> | null = null;

export function getClipGenerationQueue(): Queue<ClipGenerationJobData> {
  if (!clipGenerationQueue) {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    clipGenerationQueue = new Queue<ClipGenerationJobData>(CLIP_GENERATION_QUEUE_NAME, {
      connection: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port || '6379', 10),
        maxRetriesPerRequest: null,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 3000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return clipGenerationQueue;
}
