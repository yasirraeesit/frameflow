import { Job } from 'bullmq';
import { prisma } from '@frameflow/database';
import { GetObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { createWorkerS3Client, createRedisClient, CONFIG } from '../config.js';
import { compileTimelineToFFmpeg, TimelineDocument, ExportPreset, JobProgressEvent } from '@frameflow/shared';
import { spawn } from 'node:child_process';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { Readable } from 'node:stream';

export interface RenderJobPayload {
  renderJobId: string;
  projectId: string;
  preset: ExportPreset;
}

export const s3 = createWorkerS3Client();
export const redisPub = createRedisClient();

export function resolveDefaultFontFile(): string | undefined {
  const candidates: string[] = [];
  if (process.platform === 'win32') {
    const winDir = process.env.WINDIR || 'C:\\Windows';
    candidates.push(
      path.join(winDir, 'Fonts', 'arial.ttf'),
      path.join(winDir, 'Fonts', 'segoeui.ttf'),
      path.join(winDir, 'Fonts', 'tahoma.ttf')
    );
  } else if (process.platform === 'darwin') {
    candidates.push(
      '/System/Library/Fonts/Supplemental/Arial.ttf',
      '/System/Library/Fonts/Helvetica.ttc'
    );
  } else {
    // Linux
    candidates.push(
      '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf',
      '/usr/share/fonts/dejavu/DejaVuSans.ttf',
      '/usr/share/fonts/truetype/freefont/FreeSans.ttf'
    );
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return undefined;
}

async function publishProgress(event: JobProgressEvent) {
  try {
    const channel = `events:project:${event.projectId}`;
    await redisPub.publish(channel, JSON.stringify(event));
  } catch (err) {
    console.warn('[RenderWorker] Failed to publish progress to Redis:', err);
  }
}

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

export async function processRenderJob(job: Job<RenderJobPayload>) {
  const { renderJobId, projectId, preset } = job.data;

  // 1. Verify render job state
  const renderJob = await prisma.renderJob.findUnique({
    where: { id: renderJobId },
  });

  if (!renderJob) {
    console.log(`[RenderWorker] Render job ${renderJobId} not found in database. Skipping.`);
    return;
  }

  if (renderJob.status === 'CANCELLED') {
    console.log(`[RenderWorker] Render job ${renderJobId} was cancelled before starting. Skipping.`);
    return;
  }

  // Set status to RENDERING
  await prisma.renderJob.update({
    where: { id: renderJobId },
    data: { status: 'RENDERING', progress: 0 },
  });

  await publishProgress({
    jobId: job.id ?? renderJobId,
    projectId,
    renderJobId,
    type: 'RENDER_EXPORT',
    status: 'PROCESSING',
    progress: 5,
    message: 'Preparing timeline assets for rendering',
  });

  // 2. Fetch timeline document
  const timelineRecord = await prisma.timeline.findUnique({
    where: { projectId },
  });

  if (!timelineRecord) {
    throw new Error(`Timeline for project ${projectId} not found`);
  }

  const timelineDoc = timelineRecord.data as unknown as TimelineDocument;
  const workDir = path.join(os.tmpdir(), `frameflow-render-${renderJobId}`);
  await fs.promises.mkdir(workDir, { recursive: true });

  const outputPath = path.join(workDir, 'render-output.mp4');

  try {
    // 3. Collect unique assets from all tracks
    const distinctAssetIds = new Set<string>();
    for (const track of timelineDoc.tracks) {
      if (track.muted) continue;
      for (const clip of track.clips) {
        if (clip.assetId) {
          distinctAssetIds.add(clip.assetId);
        }
      }
    }

    const assetPathMap: Record<string, string> = {};

    // 4. Download source assets into sandboxed working directory
    for (const assetId of distinctAssetIds) {
      const asset = await prisma.asset.findUnique({
        where: { id: assetId },
      });

      if (!asset) {
        throw new Error(`Asset ${assetId} referenced in timeline does not exist`);
      }

      const localAssetPath = path.join(workDir, `${assetId}.mp4`);

      // Try raw assets bucket first, fall back to proxies bucket if needed
      let bucket = CONFIG.S3_BUCKETS.RAW;
      let s3Key = asset.s3Key;

      try {
        const s3Res = await s3.send(
          new GetObjectCommand({
            Bucket: bucket,
            Key: s3Key,
          })
        );
        const data = await streamToBuffer(s3Res.Body as Readable);
        await fs.promises.writeFile(localAssetPath, data);
      } catch {
        if (asset.proxyKey) {
          bucket = CONFIG.S3_BUCKETS.PROXIES;
          s3Key = asset.proxyKey;
          const s3Res = await s3.send(
            new GetObjectCommand({
              Bucket: bucket,
              Key: s3Key,
            })
          );
          const data = await streamToBuffer(s3Res.Body as Readable);
          await fs.promises.writeFile(localAssetPath, data);
        } else {
          throw new Error(`Failed to download source asset ${assetId}`);
        }
      }

      assetPathMap[assetId] = localAssetPath;
    }

    await publishProgress({
      jobId: job.id ?? renderJobId,
      projectId,
      renderJobId,
      type: 'RENDER_EXPORT',
      status: 'PROCESSING',
      progress: 20,
      message: 'Compiling filtergraph and starting FFmpeg engine',
    });

    // 5. Compile timeline document into FFmpeg filtergraph
    const fontFile = resolveDefaultFontFile();
    const compilerOutput = compileTimelineToFFmpeg(timelineDoc, assetPathMap, preset, { fontFile });

    // 6. Build ffmpeg argument array
    const ffmpegArgs: string[] = ['-y'];

    for (const inputPath of compilerOutput.inputs) {
      ffmpegArgs.push('-i', inputPath);
    }

    ffmpegArgs.push('-filter_complex', compilerOutput.filterComplex);
    ffmpegArgs.push(...compilerOutput.outputOptions);
    ffmpegArgs.push(outputPath);

    // 7. Execute FFmpeg child process
    await new Promise<void>((resolve, reject) => {
      const child = spawn('ffmpeg', ffmpegArgs);
      let stderrLog = '';
      let lastProgressUpdate = Date.now();
      const totalDuration = Math.max(0.1, timelineDoc.duration);

      child.stderr.on('data', (chunk: Buffer) => {
        const text = chunk.toString();
        stderrLog += text;

        // Extract time=HH:MM:SS.ms
        const timeMatch = text.match(/time=(\d+):(\d+):(\d+(?:\.\d+)?)/);
        if (timeMatch && timeMatch[1] && timeMatch[2] && timeMatch[3]) {
          const hours = parseFloat(timeMatch[1]);
          const minutes = parseFloat(timeMatch[2]);
          const seconds = parseFloat(timeMatch[3]);
          const currentSec = hours * 3600 + minutes * 60 + seconds;

          const progressPercent = Math.min(
            95,
            Math.max(20, Math.round(20 + (currentSec / totalDuration) * 75))
          );

          // Throttle updates to at most once every 300ms
          const now = Date.now();
          if (now - lastProgressUpdate > 300) {
            lastProgressUpdate = now;
            void prisma.renderJob.update({
              where: { id: renderJobId },
              data: { progress: progressPercent },
            });

            void publishProgress({
              jobId: job.id ?? renderJobId,
              projectId,
              renderJobId,
              type: 'RENDER_EXPORT',
              status: 'PROCESSING',
              progress: progressPercent,
              message: `Rendering frames... (${progressPercent}%)`,
            });
          }
        }
      });

      child.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          const lastLines = stderrLog.split('\n').slice(-10).join('\n');
          reject(new Error(`FFmpeg exited with code ${code}: ${lastLines}`));
        }
      });

      child.on('error', (err) => {
        reject(err);
      });
    });

    // 8. Upload rendered MP4 to MinIO RENDERS bucket
    const outputBuffer = await fs.promises.readFile(outputPath);
    const outputS3Key = `${projectId}/${renderJobId}.mp4`;

    await s3.send(
      new PutObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RENDERS,
        Key: outputS3Key,
        Body: outputBuffer,
        ContentType: 'video/mp4',
      })
    );

    // 9. Update DB record to COMPLETED
    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: 'COMPLETED',
        progress: 100,
        outputS3Key,
        completedAt: new Date(),
        errorMessage: null,
      },
    });

    await publishProgress({
      jobId: job.id ?? renderJobId,
      projectId,
      renderJobId,
      type: 'RENDER_EXPORT',
      status: 'DONE',
      progress: 100,
      message: 'Render finished successfully',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown rendering failure';
    console.error(`[RenderWorker] Render job ${renderJobId} failed:`, errorMsg);

    await prisma.renderJob.update({
      where: { id: renderJobId },
      data: {
        status: 'FAILED',
        errorMessage: errorMsg,
      },
    });

    await publishProgress({
      jobId: job.id ?? renderJobId,
      projectId,
      renderJobId,
      type: 'RENDER_EXPORT',
      status: 'FAILED',
      progress: 0,
      error: errorMsg,
      message: `Render failed: ${errorMsg}`,
    });

    throw err;
  } finally {
    // 10. Clean up sandboxed workspace
    try {
      await fs.promises.rm(workDir, { recursive: true, force: true });
    } catch {
      // Ignore cleanup error
    }
  }
}
