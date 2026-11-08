import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from '@frameflow/database';
import { PutObjectCommand, HeadObjectCommand } from '@aws-sdk/client-s3';
import { createWorkerS3Client, createRedisClient, CONFIG } from '../src/config.js';
import { processMediaJob, redisPub } from '../src/processors/media.processor.js';
import fs from 'node:fs';
import path from 'node:path';

describe('Worker Media Processing Pipeline', () => {
  const s3 = createWorkerS3Client();
  const redisSub = createRedisClient();

  let userId: string;
  let projectId: string;
  let assetId: string;
  const receivedEvents: Array<{ status: string; progress: number }> = [];

  before(async () => {
    // 1. Create DB records
    const user = await prisma.user.create({
      data: {
        email: `worker-test-${Date.now()}@example.com`,
        passwordHash: 'hash',
        name: 'Worker Test User',
      },
    });
    userId = user.id;

    const project = await prisma.project.create({
      data: {
        title: 'Worker Test Project',
        ownerId: userId,
      },
    });
    projectId = project.id;

    let fixturePath = path.resolve(process.cwd(), 'test-fixtures/sample.mp4');
    if (!fs.existsSync(fixturePath)) {
      fixturePath = path.resolve(process.cwd(), '../../test-fixtures/sample.mp4');
    }
    const sampleVideoBuffer = await fs.promises.readFile(fixturePath);

    const s3Key = `${projectId}/sample.mp4`;
    await s3.send(
      new PutObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RAW,
        Key: s3Key,
        Body: sampleVideoBuffer,
        ContentType: 'video/mp4',
      })
    );

    const asset = await prisma.asset.create({
      data: {
        projectId,
        originalName: 'sample.mp4',
        s3Key,
        mimeType: 'video/mp4',
        sizeBytes: BigInt(sampleVideoBuffer.length),
        status: 'QUEUED',
      },
    });
    assetId = asset.id;

    // 2. Subscribe to progress events on Redis
    await redisSub.subscribe(`events:project:${projectId}`);
    redisSub.on('message', (_channel, message) => {
      try {
        const parsed = JSON.parse(message);
        receivedEvents.push(parsed);
      } catch {
        // ignore
      }
    });
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await redisSub.quit();
    await redisPub.quit();
    await prisma.$disconnect();
  });

  it('probes metadata, generates 720p proxy and thumbnail strip', async () => {
    const mockJob = {
      id: `test-job-${Date.now()}`,
      data: {
        assetId,
        projectId,
        s3Key: `${projectId}/sample.mp4`,
        s3Bucket: CONFIG.S3_BUCKETS.RAW,
        originalName: 'sample.mp4',
        mimeType: 'video/mp4',
      },
    };

    // Run the processor directly
    await processMediaJob(mockJob as never);

    // 1. Verify Asset DB record updated
    const updated = await prisma.asset.findUnique({
      where: { id: assetId },
    });
    assert.ok(updated);
    assert.strictEqual(updated.status, 'READY');
    assert.ok(updated.duration && updated.duration >= 2.5);
    assert.strictEqual(updated.width, 1280);
    assert.strictEqual(updated.height, 720);
    assert.strictEqual(updated.fps, 30);
    assert.strictEqual(updated.videoCodec, 'h264');
    assert.ok(updated.proxyKey);
    assert.ok(updated.thumbnailSpriteKey);

    // 2. Verify proxy object exists in MinIO
    const proxyHead = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.PROXIES,
        Key: updated.proxyKey,
      })
    );
    assert.ok(proxyHead.ContentLength && proxyHead.ContentLength > 0);

    // 3. Verify thumbnail object exists in MinIO
    const thumbHead = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.THUMBNAILS,
        Key: updated.thumbnailSpriteKey,
      })
    );
    assert.ok(thumbHead.ContentLength && thumbHead.ContentLength > 0);

    // 4. Verify progress events were emitted
    assert.ok(receivedEvents.length >= 3);
    const lastEvent = receivedEvents[receivedEvents.length - 1];
    assert.strictEqual(lastEvent?.status, 'DONE');
    assert.strictEqual(lastEvent?.progress, 100);
  });
});
