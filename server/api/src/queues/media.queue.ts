import { Queue } from 'bullmq';

export const MEDIA_QUEUE_NAME = 'media-processing';

export interface MediaJobData {
  assetId: string;
  projectId: string;
  s3Key: string;
  s3Bucket: string;
  originalName: string;
  mimeType: string;
}

let mediaQueue: Queue<MediaJobData> | null = null;

export function getMediaQueue(): Queue<MediaJobData> {
  if (!mediaQueue) {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    mediaQueue = new Queue<MediaJobData>(MEDIA_QUEUE_NAME, {
      connection: {
        host: redisUrl.hostname,
        port: parseInt(redisUrl.port || '6379', 10),
        maxRetriesPerRequest: null,
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: 100,
        removeOnFail: 500,
      },
    });
  }
  return mediaQueue;
}

