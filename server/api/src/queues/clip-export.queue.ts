import { Queue } from 'bullmq';

export const CLIP_EXPORT_QUEUE_NAME = 'clip-export-queue';

export interface ClipExportJobData {
  clipId: string;
  projectId: string;
  userId: string;
  format: 'mp4_1080p' | 'mp4_4k' | 'fcpxml_premiere' | 'fcpxml_davinci' | 'subtitles_srt' | 'subtitles_vtt' | 'transcript_txt';
  includeWatermark: boolean;
}

let clipExportQueue: Queue<ClipExportJobData> | null = null;

export function getClipExportQueue(): Queue<ClipExportJobData> {
  if (!clipExportQueue) {
    const redisUrl = new URL(process.env.REDIS_URL || 'redis://localhost:6379');
    clipExportQueue = new Queue<ClipExportJobData>(CLIP_EXPORT_QUEUE_NAME, {
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
  return clipExportQueue;
}
