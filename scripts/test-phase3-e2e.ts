import { buildServer } from '../server/api/src/server.js';
import { startWorker } from '../server/worker/src/index.js';
import { prisma } from '@frameflow/database';
import { createWorkerS3Client, CONFIG } from '../server/worker/src/config.js';
import { HeadObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import { JobProgressEvent, Clip, TimelineDocument } from '@frameflow/shared';
import { spawn } from 'node:child_process';
import assert from 'node:assert';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { WebSocket } from 'ws';
import { Readable } from 'node:stream';

async function streamToBuffer(stream: Readable): Promise<Buffer> {
  const chunks: Buffer[] = [];
  for await (const chunk of stream) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks);
}

function probeVideo(filePath: string): Promise<{ width: number; height: number; duration: number; vcodec: string; acodec: string }> {
  return new Promise((resolve, reject) => {
    const ffprobe = spawn('ffprobe', [
      '-v', 'quiet',
      '-print_format', 'json',
      '-show_format',
      '-show_streams',
      filePath,
    ]);

    let output = '';
    ffprobe.stdout.on('data', (d) => (output += d));
    ffprobe.on('close', (code) => {
      if (code !== 0) return reject(new Error(`ffprobe failed with code ${code}`));
      try {
        const info = JSON.parse(output);
        const vstream = info.streams?.find((s: any) => s.codec_type === 'video');
        const astream = info.streams?.find((s: any) => s.codec_type === 'audio');
        resolve({
          width: vstream?.width ?? 0,
          height: vstream?.height ?? 0,
          duration: parseFloat(info.format?.duration ?? '0'),
          vcodec: vstream?.codec_name ?? '',
          acodec: astream?.codec_name ?? '',
        });
      } catch (err) {
        reject(err);
      }
    });
  });
}

async function runPhase3E2E() {
  console.log('====================================================');
  console.log('   FRAMEFLOW PHASE 3: RENDERING PIPELINE E2E TEST   ');
  console.log('====================================================');

  const s3 = createWorkerS3Client();
  const testPort = 4003;

  // 1. Start dedicated API server & Worker for E2E
  console.log(`[E2E] Starting Fastify API on port ${testPort}...`);
  const app = buildServer();
  await app.listen({ port: testPort, host: '127.0.0.1' });

  console.log('[E2E] Starting BullMQ Media & Render Workers...');
  const { mediaWorker, renderWorker } = startWorker();

  let userId: string | null = null;
  const tempFiles: string[] = [];
  let ws: WebSocket | null = null;

  try {
    // 2. Auth: Register user
    const email = `phase3-tester-${Date.now()}@example.com`;
    console.log(`[E2E Step 1] Registering user ${email}...`);
    const regRes = await fetch(`http://127.0.0.1:${testPort}/api/auth/register`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
        name: 'Phase 3 Render Tester',
      }),
    });
    assert.strictEqual(regRes.status, 201);
    const { token, user } = await regRes.json();
    userId = user.id;
    console.log(`[E2E Step 1 PASS] User registered: ${userId}`);

    // 3. Create Project
    console.log('[E2E Step 2] Creating project...');
    const projRes = await fetch(`http://127.0.0.1:${testPort}/api/projects`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Phase 3 Cinematic Render',
        fps: 30,
        width: 1920,
        height: 1080,
      }),
    });
    assert.strictEqual(projRes.status, 201);
    const { project } = await projRes.json();
    const projectId = project.id;
    console.log(`[E2E Step 2 PASS] Project created: ${projectId}`);

    // 4. Connect WebSocket client
    console.log('[E2E Step 3] Connecting WebSocket to receive live render events...');
    const receivedEvents: JobProgressEvent[] = [];
    ws = new WebSocket(`ws://127.0.0.1:${testPort}/ws`);

    await new Promise<void>((resolve) => {
      ws!.on('open', () => {
        ws!.send(JSON.stringify({ type: 'subscribe', projectId }));
        resolve();
      });
      ws!.on('message', (msg) => {
        try {
          const parsed = JSON.parse(msg.toString());
          if (parsed.type === 'RENDER_EXPORT' || parsed.type === 'PROXY_GENERATION') {
            receivedEvents.push(parsed);
          }
        } catch {}
      });
    });
    console.log('[E2E Step 3 PASS] WebSocket connected and subscribed');

    // 5. Generate a synthetic 3-second test clip
    console.log('[E2E Step 4] Generating synthetic 3-second test video clip...');
    const testClipPath = path.join(os.tmpdir(), `phase3-source-${Date.now()}.mp4`);
    tempFiles.push(testClipPath);

    await new Promise<void>((resolve, reject) => {
      const child = spawn('ffmpeg', [
        '-y',
        '-f', 'lavfi',
        '-i', 'testsrc=size=1280x720:rate=30:duration=3',
        '-f', 'lavfi',
        '-i', 'sine=frequency=440:duration=3',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        testClipPath,
      ]);
      child.on('close', (code) => {
        if (code === 0) resolve();
        else reject(new Error(`Failed to generate test clip: code ${code}`));
      });
    });
    const clipBuffer = await fs.promises.readFile(testClipPath);

    // 6. Upload test clip to project
    console.log('[E2E Step 5] Performing multipart upload of source video...');
    const initRes = await fetch(`http://127.0.0.1:${testPort}/api/projects/${projectId}/assets/upload/init`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        filename: 'source-clip.mp4',
        mimeType: 'video/mp4',
        sizeBytes: clipBuffer.length,
      }),
    });
    const { uploadId, key } = await initRes.json();

    const chunkRes = await fetch(
      `http://127.0.0.1:${testPort}/api/projects/${projectId}/assets/upload/chunk?uploadId=${encodeURIComponent(uploadId)}&key=${encodeURIComponent(key)}&partNumber=1`,
      {
        method: 'PUT',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/octet-stream',
        },
        body: clipBuffer,
      }
    );
    const { etag } = await chunkRes.json();

    const completeRes = await fetch(`http://127.0.0.1:${testPort}/api/projects/${projectId}/assets/upload/complete`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        uploadId,
        key,
        filename: 'source-clip.mp4',
        mimeType: 'video/mp4',
        sizeBytes: clipBuffer.length,
        parts: [{ partNumber: 1, etag }],
      }),
    });
    assert.strictEqual(completeRes.status, 201);
    const { asset } = await completeRes.json();
    console.log(`[E2E Step 5 PASS] Asset uploaded: ${asset.id}`);

    // Wait for asset proxy processing to finish
    console.log('[E2E Step 6] Waiting for source asset proxy generation...');
    let assetReady = false;
    for (let i = 0; i < 30; i++) {
      const a = await prisma.asset.findUnique({ where: { id: asset.id } });
      if (a?.status === 'READY') {
        assetReady = true;
        break;
      }
      await new Promise((r) => setTimeout(r, 500));
    }
    assert.strictEqual(assetReady, true, 'Asset must become READY');
    console.log('[E2E Step 6 PASS] Source asset processed and ready');

    // 7. Assemble Multi-Track Timeline (Video + Text Overlay)
    console.log('[E2E Step 7] Assembling timeline with video clip and title overlay...');
    const videoClip: Clip = {
      id: 'clip-v1',
      assetId: asset.id,
      name: 'Scene 1',
      start: 0,
      duration: 3,
      inPoint: 0,
      outPoint: 3,
      speed: 1,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: null,
    };

    const textClip: Clip = {
      id: 'clip-t1',
      assetId: null,
      name: 'Title Overlay',
      start: 0.5,
      duration: 2.0,
      inPoint: 0,
      outPoint: 2.0,
      speed: 1,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: {
        text: 'FrameFlow Cinematic',
        fontSize: 48,
        color: '#ffffff',
        position: { x: 50, y: 50 },
      },
    };

    const timelineData: TimelineDocument = {
      id: 'tl-phase3',
      projectId,
      version: 2,
      fps: 30,
      duration: 3,
      tracks: [
        {
          id: 'track-v1',
          type: 'VIDEO',
          name: 'Video 1',
          locked: false,
          muted: false,
          clips: [videoClip],
        },
        {
          id: 'track-a1',
          type: 'AUDIO',
          name: 'Audio 1',
          locked: false,
          muted: false,
          clips: [],
        },
        {
          id: 'track-t1',
          type: 'TEXT',
          name: 'Titles',
          locked: false,
          muted: false,
          clips: [textClip],
        },
      ],
      markers: [],
    };

    const saveTlRes = await fetch(`http://127.0.0.1:${testPort}/api/projects/${projectId}/timeline`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ data: timelineData }),
    });
    assert.strictEqual(saveTlRes.status, 200);
    console.log('[E2E Step 7 PASS] Timeline saved to PostgreSQL');

    // 8. Trigger Asynchronous 1080p Render Job
    console.log('[E2E Step 8] Triggering asynchronous 1080p render export job...');
    const renderRes = await fetch(`http://127.0.0.1:${testPort}/api/projects/${projectId}/renders`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ preset: '1080p_h264' }),
    });
    assert.strictEqual(renderRes.status, 201);
    const { renderJob } = await renderRes.json();
    const renderJobId = renderJob.id;
    assert.strictEqual(renderJob.status, 'QUEUED');
    console.log(`[E2E Step 8 PASS] Render job queued: ${renderJobId}`);

    // 9. Monitor progress via BullMQ / WebSocket / PostgreSQL
    console.log('[E2E Step 9] Awaiting render completion (tracking live progress)...');
    let renderDone = false;
    let finalJob: any = null;

    for (let i = 0; i < 40; i++) {
      finalJob = await prisma.renderJob.findUnique({ where: { id: renderJobId } });
      if (finalJob?.status === 'COMPLETED') {
        renderDone = true;
        break;
      }
      if (finalJob?.status === 'FAILED') {
        throw new Error(`Render job failed: ${finalJob.errorMessage}`);
      }
      await new Promise((r) => setTimeout(r, 500));
    }

    assert.strictEqual(renderDone, true, 'Render job must reach COMPLETED status');
    assert.strictEqual(finalJob.progress, 100);
    assert.ok(finalJob.outputS3Key, 'Render output key must be set');
    console.log(`[E2E Step 9 PASS] Render finished: outputS3Key = ${finalJob.outputS3Key}`);

    // 10. Verify WebSocket received progress events
    const renderEvents = receivedEvents.filter((e) => e.type === 'RENDER_EXPORT');
    assert.ok(renderEvents.length >= 2, 'Must receive multiple WebSocket render progress events');
    const doneEvent = renderEvents.find((e) => e.status === 'DONE');
    assert.ok(doneEvent, 'Must receive DONE WebSocket event');
    console.log(`[E2E Step 10 PASS] Received ${renderEvents.length} live render progress events via WebSocket`);

    // 11. Verify MinIO object and download for ffprobe inspection
    console.log('[E2E Step 11] Inspecting rendered MP4 in MinIO storage via ffprobe...');
    const headRes = await s3.send(
      new HeadObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RENDERS,
        Key: finalJob.outputS3Key,
      })
    );
    assert.ok(headRes.ContentLength && headRes.ContentLength > 10000, 'Rendered file must have substantial size');

    const getRes = await s3.send(
      new GetObjectCommand({
        Bucket: CONFIG.S3_BUCKETS.RENDERS,
        Key: finalJob.outputS3Key,
      })
    );
    const renderedBytes = await streamToBuffer(getRes.Body as Readable);
    const localRenderPath = path.join(os.tmpdir(), `phase3-rendered-${Date.now()}.mp4`);
    tempFiles.push(localRenderPath);
    await fs.promises.writeFile(localRenderPath, renderedBytes);

    const probe = await probeVideo(localRenderPath);
    console.log(`  - Rendered Resolution: ${probe.width}x${probe.height} (Expected: 1920x1080)`);
    console.log(`  - Rendered Duration: ${probe.duration}s (Expected: ~3.0s)`);
    console.log(`  - Video Codec: ${probe.vcodec} (Expected: h264)`);
    console.log(`  - Audio Codec: ${probe.acodec} (Expected: aac)`);

    assert.strictEqual(probe.width, 1920, 'Width must be 1920 for 1080p preset');
    assert.strictEqual(probe.height, 1080, 'Height must be 1080 for 1080p preset');
    assert.strictEqual(probe.vcodec, 'h264', 'Video codec must be h264');
    assert.strictEqual(probe.acodec, 'aac', 'Audio codec must be aac');
    assert.ok(Math.abs(probe.duration - 3.0) < 0.2, 'Duration must match timeline duration');
    console.log('[E2E Step 11 PASS] Rendered video probe validated 100% against export specifications');

    // 12. Test Cancellation Path
    console.log('[E2E Step 12] Testing render job cancellation...');
    const cancelJobRes = await fetch(`http://127.0.0.1:${testPort}/api/projects/${projectId}/renders`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ preset: '720p_h264' }),
    });
    const { renderJob: jobToCancel } = await cancelJobRes.json();

    const doCancelRes = await fetch(
      `http://127.0.0.1:${testPort}/api/projects/${projectId}/renders/${jobToCancel.id}/cancel`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }
    );
    assert.strictEqual(doCancelRes.status, 200);
    const { renderJob: cancelledJob } = await doCancelRes.json();
    assert.strictEqual(cancelledJob.status, 'CANCELLED');
    console.log(`[E2E Step 12 PASS] Render job ${jobToCancel.id} cancelled cleanly`);

    console.log('====================================================');
    console.log('   >>> PHASE 3 E2E VERIFICATION COMPLETED: 100% PASS <<<');
    console.log('====================================================');
  } finally {
    if (ws) {
      ws.close();
    }
    for (const f of tempFiles) {
      try {
        if (fs.existsSync(f)) await fs.promises.unlink(f);
      } catch {}
    }
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await mediaWorker.close();
    await renderWorker.close();
    await app.close();
  }
}

runPhase3E2E()
  .then(() => {
    console.log('[E2E] Suite completed successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('[E2E] Suite failed with error:', err);
    process.exit(1);
  });
