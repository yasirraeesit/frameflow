import { buildServer } from '../apps/api/src/server.js';
import { startWorker } from '../apps/worker/src/index.js';
import { prisma } from '@frameflow/database';
import { createWorkerS3Client, CONFIG } from '../apps/worker/src/config.js';
import { HeadObjectCommand } from '@aws-sdk/client-s3';
import { JobProgressEvent } from '@frameflow/shared';
import fs from 'node:fs';
import path from 'node:path';

async function runE2ETest() {
  console.log('--- STARTING PHASE 1 END-TO-END VERIFICATION ---');

  const s3 = createWorkerS3Client();

  // 1. Start Fastify API server
  console.log('[E2E] Starting Fastify API Server on port 4001...');
  const app = buildServer();
  const address = await app.listen({ port: 4001, host: '127.0.0.1' });
  console.log(`[E2E] API Server running at ${address}`);

  // 2. Start Worker
  console.log('[E2E] Starting BullMQ Media Worker...');
  const worker = startWorker();

  let ws: WebSocket | null = null;
  const receivedEvents: JobProgressEvent[] = [];

  try {
    // 3. Register user
    const email = `e2e-user-${Date.now()}@example.com`;
    console.log(`[E2E] Registering user ${email}...`);
    const regRes = await fetch('http://127.0.0.1:4001/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
        name: 'E2E Full Stack Tester',
      }),
    });
    if (!regRes.ok) throw new Error(`Registration failed: ${await regRes.text()}`);
    const { token, user } = await regRes.json();
    console.log(`[E2E] User registered: ${user.id} (${user.email})`);

    // 4. Create project
    console.log('[E2E] Creating video project...');
    const projRes = await fetch('http://127.0.0.1:4001/api/projects', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Phase 1 E2E Movie',
        description: 'Testing chunked upload, ffprobe, proxy, and websocket events',
        fps: 30,
        width: 1920,
        height: 1080,
      }),
    });
    if (!projRes.ok) throw new Error(`Project creation failed: ${await projRes.text()}`);
    const { project } = await projRes.json();
    console.log(`[E2E] Project created: ${project.id} ("${project.title}")`);

    // 5. Connect WebSocket client
    console.log('[E2E] Connecting WebSocket client to ws://127.0.0.1:4001/ws...');
    ws = new WebSocket('ws://127.0.0.1:4001/ws');
    await new Promise<void>((resolve, reject) => {
      if (!ws) return reject(new Error('No ws'));
      ws.onopen = () => resolve();
      ws.onerror = (err) => reject(err);
    });

    ws.onmessage = (msgEvent) => {
      try {
        const data = JSON.parse(msgEvent.data.toString());
        if (data.type !== 'subscribed') {
          console.log(
            `[E2E] << WebSocket Event received: type=${data.type} status=${data.status} progress=${data.progress}% message="${data.message}"`
          );
          receivedEvents.push(data);
        } else {
          console.log(`[E2E] << WebSocket subscription confirmed for project ${data.projectId}`);
        }
      } catch {
        // ignore
      }
    };

    ws.send(JSON.stringify({ type: 'subscribe', projectId: project.id }));
    await new Promise((r) => setTimeout(r, 200));

    // 6. Read sample video file fixture
    const fixturePath = path.resolve(process.cwd(), 'test-fixtures/sample.mp4');
    const fileBuffer = await fs.promises.readFile(fixturePath);
    console.log(`[E2E] Loaded test fixture (${fileBuffer.length} bytes)`);

    // 7. Init multipart upload
    console.log('[E2E] Initializing multipart upload...');
    const initRes = await fetch(`http://127.0.0.1:4001/api/projects/${project.id}/assets/upload/init`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'sample.mp4',
        mimeType: 'video/mp4',
        sizeBytes: fileBuffer.length,
      }),
    });
    if (!initRes.ok) throw new Error(`Init upload failed: ${await initRes.text()}`);
    const { uploadId, key, partSize } = await initRes.json();
    console.log(`[E2E] Multipart upload initiated: uploadId=${uploadId}, key=${key}`);

    // 8. Upload chunks
    const totalParts = Math.ceil(fileBuffer.length / partSize);
    const parts: { partNumber: number; etag: string }[] = [];

    for (let partNumber = 1; partNumber <= totalParts; partNumber++) {
      const start = (partNumber - 1) * partSize;
      const end = Math.min(start + partSize, fileBuffer.length);
      const chunk = fileBuffer.subarray(start, end);

      console.log(`[E2E] Uploading chunk ${partNumber}/${totalParts} (${chunk.length} bytes)...`);
      const chunkUrl = `http://127.0.0.1:4001/api/projects/${project.id}/assets/upload/chunk?uploadId=${encodeURIComponent(
        uploadId
      )}&key=${encodeURIComponent(key)}&partNumber=${partNumber}`;

      const chunkRes = await fetch(chunkUrl, {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/octet-stream',
        },
        body: chunk,
      });

      if (!chunkRes.ok) throw new Error(`Chunk ${partNumber} failed: ${await chunkRes.text()}`);
      const { etag } = await chunkRes.json();
      parts.push({ partNumber, etag });
    }

    // 9. Complete upload
    console.log('[E2E] Completing multipart upload and enqueuing background worker job...');
    const completeRes = await fetch(
      `http://127.0.0.1:4001/api/projects/${project.id}/assets/upload/complete`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({
          uploadId,
          key,
          filename: 'sample.mp4',
          mimeType: 'video/mp4',
          sizeBytes: fileBuffer.length,
          parts,
        }),
      }
    );
    if (!completeRes.ok) throw new Error(`Complete failed: ${await completeRes.text()}`);
    const { asset } = await completeRes.json();
    console.log(`[E2E] Asset record created in DB: id=${asset.id}, status=${asset.status}`);

    // 10. Wait for Worker to process asset (polling DB + listening to WS)
    console.log('[E2E] Waiting for background worker processing to complete...');
    let readyAsset = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const current = await prisma.asset.findUnique({
        where: { id: asset.id },
      });
      if (current?.status === 'READY') {
        readyAsset = current;
        break;
      }
      if (current?.status === 'FAILED') {
        throw new Error(`Worker processing failed: ${current.errorMessage}`);
      }
    }

    if (!readyAsset) {
      throw new Error('Timed out waiting for asset processing to complete');
    }

    console.log('[E2E] Asset status is READY in database!');
    console.log(`[E2E] - Duration: ${readyAsset.duration}s`);
    console.log(`[E2E] - Resolution: ${readyAsset.width}x${readyAsset.height}`);
    console.log(`[E2E] - FPS: ${readyAsset.fps}`);
    console.log(`[E2E] - Video Codec: ${readyAsset.videoCodec}`);
    console.log(`[E2E] - Audio Codec: ${readyAsset.audioCodec}`);
    console.log(`[E2E] - Proxy S3 Key: ${readyAsset.proxyKey}`);
    console.log(`[E2E] - Thumbnail S3 Key: ${readyAsset.thumbnailSpriteKey}`);

    // 11. Verify MinIO S3 objects
    console.log('[E2E] Verifying objects in MinIO S3 storage...');
    const rawHead = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RAW,
        Key: readyAsset.s3Key,
      })
    );
    console.log(`[E2E] - Raw asset in MinIO: ${rawHead.ContentLength} bytes`);

    const proxyHead = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.PROXIES,
        Key: readyAsset.proxyKey!,
      })
    );
    console.log(`[E2E] - 720p proxy in MinIO: ${proxyHead.ContentLength} bytes`);

    const thumbHead = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.THUMBNAILS,
        Key: readyAsset.thumbnailSpriteKey!,
      })
    );
    console.log(`[E2E] - Thumbnail strip in MinIO: ${thumbHead.ContentLength} bytes`);

    // 12. Verify WebSocket events received
    console.log(`[E2E] Total WebSocket progress events received: ${receivedEvents.length}`);
    if (receivedEvents.length === 0) {
      throw new Error('Expected WebSocket progress events, but received none');
    }

    console.log('--- PHASE 1 END-TO-END VERIFICATION SUCCESSFUL! ---');
  } finally {
    if (ws) ws.close();
    await worker.close();
    await app.close();
    await prisma.$disconnect();
  }
}

void runE2ETest().then(() => {
  process.exit(0);
}).catch((err) => {
  console.error(err);
  process.exit(1);
});
