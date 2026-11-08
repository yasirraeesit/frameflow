import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '@frameflow/database';
import { processRenderJob, redisPub } from '../src/processors/render.processor.js';
import { createWorkerS3Client, CONFIG } from '../src/config.js';
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { spawn } from 'node:child_process';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

describe('Render Worker Processor', () => {
  const s3 = createWorkerS3Client();
  let userId: string;
  let projectId: string;
  let assetId: string;
  let renderJobId: string;
  let fixturePath: string;

  before(async () => {
    // 1. Create a 2-second synthetic MP4 test clip using ffmpeg
    fixturePath = path.join(os.tmpdir(), `test-render-fixture-${Date.now()}.mp4`);
    await new Promise<void>((resolve, reject) => {
      const child = spawn('ffmpeg', [
        '-y',
        '-f', 'lavfi',
        '-i', 'testsrc=size=640x360:rate=30:duration=2',
        '-f', 'lavfi',
        '-i', 'sine=frequency=1000:duration=2',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        fixturePath,
      ]);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`FFmpeg fixture generation failed with code ${code}`));
      });
    });

    // 2. Create User, Project, Asset, and Timeline in PostgreSQL
    const user = await prisma.user.create({
      data: {
        email: `render-test-${Date.now()}@example.com`,
        passwordHash: 'dummy',
        name: 'Render Tester',
      },
    });
    userId = user.id;

    const project = await prisma.project.create({
      data: {
        title: 'Render Test Project',
        ownerId: userId,
        fps: 30,
        width: 1280,
        height: 720,
      },
    });
    projectId = project.id;

    const rawKey = `${projectId}/asset-raw.mp4`;
    const fixtureBuffer = await fs.promises.readFile(fixturePath);
    await s3.send(
      new PutObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RAW,
        Key: rawKey,
        Body: fixtureBuffer,
        ContentType: 'video/mp4',
      })
    );

    const asset = await prisma.asset.create({
      data: {
        projectId,
        originalName: 'test-source.mp4',
        s3Key: rawKey,
        mimeType: 'video/mp4',
        sizeBytes: BigInt(fixtureBuffer.length),
        status: 'READY',
        duration: 2,
      },
    });
    assetId = asset.id;

    // 3. Create Timeline with the asset clip
    const timelineData = {
      id: 'tl-render-test',
      projectId,
      version: 1,
      fps: 30,
      duration: 2,
      tracks: [
        {
          id: 'v1',
          type: 'VIDEO',
          name: 'Video 1',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'c1',
              assetId,
              name: 'Test Clip',
              start: 0,
              duration: 2,
              inPoint: 0,
              outPoint: 2,
              speed: 1,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: null,
            },
          ],
        },
      ],
      markers: [],
    };

    await prisma.timeline.create({
      data: {
        projectId,
        version: 1,
        data: timelineData,
      },
    });

    // 4. Create RenderJob
    const renderJob = await prisma.renderJob.create({
      data: {
        projectId,
        preset: '720p_h264',
        status: 'QUEUED',
        progress: 0,
      },
    });
    renderJobId = renderJob.id;
  });

  after(async () => {
    if (fs.existsSync(fixturePath)) {
      try {
        await fs.promises.unlink(fixturePath);
      } catch {}
    }
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await redisPub.quit();
  });

  it('renders a 720p timeline to MinIO and updates job status to COMPLETED', async () => {
    const mockJob = {
      id: `job-${renderJobId}`,
      data: {
        renderJobId,
        projectId,
        preset: '720p_h264' as const,
      },
    } as any;

    await processRenderJob(mockJob);

    // Verify DB record
    const updatedJob = await prisma.renderJob.findUnique({
      where: { id: renderJobId },
    });
    assert.ok(updatedJob);
    assert.strictEqual(updatedJob.status, 'COMPLETED');
    assert.strictEqual(updatedJob.progress, 100);
    assert.ok(updatedJob.outputS3Key);
    assert.strictEqual(updatedJob.errorMessage, null);

    // Verify MinIO rendered object exists
    const headRes = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RENDERS,
        Key: updatedJob.outputS3Key!,
      })
    );
    assert.ok(headRes.ContentLength && headRes.ContentLength > 0);
  });
});
