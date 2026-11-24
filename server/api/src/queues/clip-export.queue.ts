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

export function getClipExportQueue(): Queue<ClipExportJobData> {
  if (!clipExportQueue) {
    clipExportQueue = new Queue<ClipExportJobData>(CLIP_EXPORT_QUEUE_NAME, {
      connection: parseBullMqConnection(process.env.REDIS_URL || 'redis://localhost:6379'),
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
