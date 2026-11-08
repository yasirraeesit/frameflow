import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';
import { closeRenderQueue } from '../src/queues/render.queue.js';

describe('Render Jobs API Endpoints', () => {
  const app = buildServer();
  let token: string;
  let userId: string;
  let projectId: string;
  let renderJobId: string;

  before(async () => {
    await app.ready();
    const email = `render-api-tester-${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
        name: 'Render API Tester',
      },
    });
    const authData = JSON.parse(regRes.payload);
    token = authData.token;
    userId = authData.user.id;

    const projRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Render API Test Project' },
    });
    const projData = JSON.parse(projRes.payload);
    projectId = projData.project.id;
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await closeRenderQueue();
    await app.close();
  });

  it('creates an asynchronous render job in QUEUED status', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/renders`,
      headers: { authorization: `Bearer ${token}` },
      payload: { preset: '1080p_h264' },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.renderJob);
    assert.strictEqual(body.renderJob.projectId, projectId);
    assert.strictEqual(body.renderJob.preset, '1080p_h264');
    assert.strictEqual(body.renderJob.status, 'QUEUED');
    assert.strictEqual(body.renderJob.progress, 0);

    renderJobId = body.renderJob.id;
  });

  it('lists render jobs for the project', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/projects/${projectId}/renders`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.renderJobs));
    assert.ok(body.renderJobs.length >= 1);
    assert.strictEqual(body.renderJobs[0].id, renderJobId);
  });

  it('fetches specific render job details', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/projects/${projectId}/renders/${renderJobId}`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.renderJob);
    assert.strictEqual(body.renderJob.id, renderJobId);
  });

  it('cancels an in-flight or queued render job', async () => {
    const res = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/renders/${renderJobId}/cancel`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.renderJob.status, 'CANCELLED');
  });
});
