import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';
import { getMediaQueue } from '../src/queues/media.queue.js';

describe('Assets Chunked Upload API', () => {
  const app = buildServer();
  let token: string;
  let userId: string;
  let projectId: string;

  before(async () => {
    await app.ready();
    const email = `asset-test-owner-${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
        name: 'Asset Test Owner',
      },
    });
    const authData = JSON.parse(regRes.payload);
    token = authData.token;
    userId = authData.user.id;

    const projRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Asset Test Project' },
    });
    const projData = JSON.parse(projRes.payload);
    projectId = projData.project.id;
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await getMediaQueue().close();
    await app.close();
  });

  it('performs full chunked upload, creates asset, and enqueues job', async () => {
    // 1. Init upload
    const initRes = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/assets/upload/init`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        filename: 'test-sample.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 1024 * 1024 * 5, // 5MB
      },
    });

    assert.strictEqual(initRes.statusCode, 200);
    const { uploadId, key, partSize } = JSON.parse(initRes.payload);
    assert.ok(uploadId);
    assert.ok(key);
    assert.ok(partSize > 0);

    // 2. Upload chunk
    // MinIO / S3 requires at least 5MB for multi-part parts (except last part)
    const chunkBuffer = Buffer.alloc(1024 * 1024 * 5, 0xaa);

    const chunkRes = await app.inject({
      method: 'PUT',
      url: `/api/projects/${projectId}/assets/upload/chunk?uploadId=${uploadId}&key=${encodeURIComponent(key)}&partNumber=1`,
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/octet-stream',
      },
      payload: chunkBuffer,
    });

    assert.strictEqual(chunkRes.statusCode, 200);
    const { etag } = JSON.parse(chunkRes.payload);
    assert.ok(etag);

    // 3. Complete upload
    const completeRes = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/assets/upload/complete`,
      headers: { authorization: `Bearer ${token}` },
      payload: {
        uploadId,
        key,
        filename: 'test-sample.mp4',
        mimeType: 'video/mp4',
        sizeBytes: 1024 * 1024 * 5,
        parts: [{ partNumber: 1, etag }],
      },
    });

    assert.strictEqual(completeRes.statusCode, 201);
    const { asset } = JSON.parse(completeRes.payload);
    assert.ok(asset.id);
    assert.strictEqual(asset.originalName, 'test-sample.mp4');
    assert.strictEqual(asset.status, 'QUEUED');

    // 4. Verify asset is in database
    const dbAsset = await prisma.asset.findUnique({
      where: { id: asset.id },
    });
    assert.ok(dbAsset);
    assert.strictEqual(dbAsset.originalName, 'test-sample.mp4');

    // 5. Verify asset listing endpoint
    const listRes = await app.inject({
      method: 'GET',
      url: `/api/projects/${projectId}/assets`,
      headers: { authorization: `Bearer ${token}` },
    });
    assert.strictEqual(listRes.statusCode, 200);
    const listBody = JSON.parse(listRes.payload);
    assert.strictEqual(listBody.assets.length, 1);
    assert.strictEqual(listBody.assets[0].id, asset.id);
  });
});
