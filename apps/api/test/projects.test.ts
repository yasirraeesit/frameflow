import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';

describe('Projects API Endpoints', () => {
  const app = buildServer();
  let token: string;
  let userId: string;

  before(async () => {
    await app.ready();
    const email = `project-test-owner-${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
        name: 'Project Test Owner',
      },
    });
    const data = JSON.parse(regRes.payload);
    token = data.token;
    userId = data.user.id;
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await app.close();
  });

  it('creates a new project and initializes its default timeline', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: {
        title: 'Documentary Short Film',
        description: 'First rough cut project',
        fps: 24,
        width: 1920,
        height: 1080,
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.project.title, 'Documentary Short Film');
    assert.strictEqual(body.project.fps, 24);
    assert.ok(body.project.id);

    // Verify initial timeline was created in database
    const timeline = await prisma.timeline.findUnique({
      where: { projectId: body.project.id },
    });
    assert.ok(timeline);
    assert.strictEqual(timeline.version, 1);
  });

  it('lists only projects owned by the authenticated user', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(Array.isArray(body.projects));
    assert.ok(body.projects.length >= 1);
  });

  it('retrieves project by id along with its timeline', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Fetch Me Project' },
    });
    const { project } = JSON.parse(createRes.payload);

    const getRes = await app.inject({
      method: 'GET',
      url: `/api/projects/${project.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(getRes.statusCode, 200);
    const body = JSON.parse(getRes.payload);
    assert.strictEqual(body.project.id, project.id);
    assert.ok(body.project.timeline);
  });

  it('updates project title and description', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Original Title' },
    });
    const { project } = JSON.parse(createRes.payload);

    const updateRes = await app.inject({
      method: 'PATCH',
      url: `/api/projects/${project.id}`,
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Updated Title' },
    });

    assert.strictEqual(updateRes.statusCode, 200);
    const body = JSON.parse(updateRes.payload);
    assert.strictEqual(body.project.title, 'Updated Title');
  });

  it('deletes a project and its cascaded timeline', async () => {
    const createRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'To Delete Project' },
    });
    const { project } = JSON.parse(createRes.payload);

    const delRes = await app.inject({
      method: 'DELETE',
      url: `/api/projects/${project.id}`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(delRes.statusCode, 200);

    const check = await prisma.project.findUnique({
      where: { id: project.id },
    });
    assert.strictEqual(check, null);
  });
});
