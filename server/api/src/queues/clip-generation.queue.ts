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

export function getClipGenerationQueue(): Queue<ClipGenerationJobData> {
  if (!clipGenerationQueue) {
    clipGenerationQueue = new Queue<ClipGenerationJobData>(CLIP_GENERATION_QUEUE_NAME, {
      connection: parseBullMqConnection(process.env.REDIS_URL || 'redis://localhost:6379'),
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
