import { Job } from 'bullmq';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { prisma } from '@frameflow/database';
import { JobProgressEvent } from '@frameflow/shared';
import { CONFIG, createWorkerS3Client, createRedisClient } from '../config.js';
import { probeMedia } from '../ffmpeg/ffprobe.js';
import { generateProxy } from '../ffmpeg/proxy.js';
import { generateThumbnailStrip } from '../ffmpeg/thumbnail.js';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { pipeline } from 'node:stream/promises';
import { Readable } from 'node:stream';

export interface ProcessMediaJobData {
  assetId: string;
  projectId: string;
  s3Key: string;
  s3Bucket: string;
  originalName: string;
  mimeType: string;
}

export const s3 = createWorkerS3Client();
export const redisPub = createRedisClient();

async function publishProgress(event: JobProgressEvent) {
  const channel = `events:project:${event.projectId}`;
  await redisPub.publish(channel, JSON.stringify(event));
}

export async function processMediaJob(job: Job<ProcessMediaJobData>): Promise<void> {
  const { assetId, projectId, s3Key, s3Bucket } = job.data;
  const tempDir = path.join(os.tmpdir(), `frameflow-job-${job.id}-${Date.now()}`);
  await fs.promises.mkdir(tempDir, { recursive: true });

  const rawExt = path.extname(s3Key) || '.mp4';
  const rawLocalPath = path.join(tempDir, `raw${rawExt}`);
  const proxyLocalPath = path.join(tempDir, 'proxy-720p.mp4');
  const thumbLocalPath = path.join(tempDir, 'thumbnails.jpg');

  try {
    const existingAsset = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    if (!existingAsset) {
      console.warn(`[Worker] Asset ${assetId} not found in database (may have been deleted). Skipping.`);
      return;
    }

    await prisma.asset.update({
      where: { id: assetId },
      data: { status: 'PROCESSING' },
    });

    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'METADATA_EXTRACTION',
      status: 'PROCESSING',
      progress: 5,
      message: 'Downloading raw media from storage',
    });

    // 1. Download raw file from MinIO
    const getCommand = new GetObjectCommand({
      Bucket: s3Bucket,
      Key: s3Key,
    });
    const s3Res = await s3.send(getCommand);
    if (!s3Res.Body) {
      throw new Error(`Failed to retrieve object from storage: ${s3Key}`);
    }

    const fileStream = fs.createWriteStream(rawLocalPath);
    await pipeline(s3Res.Body as Readable, fileStream);

    // 2. Extract metadata via ffprobe
    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'METADATA_EXTRACTION',
      status: 'PROCESSING',
      progress: 25,
      message: 'Extracting video metadata',
    });

    const meta = await probeMedia(rawLocalPath);

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        duration: meta.duration,
        width: meta.width,
        height: meta.height,
        fps: meta.fps,
        videoCodec: meta.videoCodec,
        audioCodec: meta.audioCodec,
      },
    });

    // 3. Generate 720p Proxy via FFmpeg
    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'PROXY_GENERATION',
      status: 'PROCESSING',
      progress: 50,
      message: 'Generating 720p editing proxy',
    });

    await generateProxy(rawLocalPath, proxyLocalPath);

    const proxyKey = `${projectId}/${assetId}/proxy-720p.mp4`;
    const proxyData = await fs.promises.readFile(proxyLocalPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.PROXIES,
        Key: proxyKey,
        Body: proxyData,
        ContentType: 'video/mp4',
      })
    );

    // 4. Generate Thumbnail Strip
    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'THUMBNAIL_GENERATION',
      status: 'PROCESSING',
      progress: 80,
      message: 'Generating timeline thumbnail strip',
    });

    await generateThumbnailStrip(rawLocalPath, thumbLocalPath, meta.duration);

    const thumbKey = `${projectId}/${assetId}/thumbnail.jpg`;
    const thumbData = await fs.promises.readFile(thumbLocalPath);
    await s3.send(
      new PutObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.THUMBNAILS,
        Key: thumbKey,
        Body: thumbData,
        ContentType: 'image/jpeg',
      })
    );

    // 5. Finalize asset in database
    await prisma.asset.update({
      where: { id: assetId },
      data: {
        proxyKey,
        thumbnailSpriteKey: thumbKey,
        status: 'READY',
      },
    });

    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'PROXY_GENERATION',
      status: 'DONE',
      progress: 100,
      message: 'Asset ready for editing',
      payload: {
        proxyKey,
        thumbnailSpriteKey: thumbKey,
        duration: meta.duration,
      },
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`Error processing asset ${assetId}:`, err);

    await prisma.asset.update({
      where: { id: assetId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
      },
    });

    await publishProgress({
      jobId: job.id ?? assetId,
      projectId,
      assetId,
      type: 'METADATA_EXTRACTION',
      status: 'FAILED',
      progress: 0,
      error: errorMsg,
    });

    throw err;
  } finally {
    // Cleanup temporary files
    try {
      await fs.promises.rm(tempDir, { recursive: true, force: true });
    } catch {
      // ignore cleanup errors
    }
  }
}
