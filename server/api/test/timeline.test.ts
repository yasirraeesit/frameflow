import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';

describe('Timeline API & Version History Endpoints', () => {
  const app = buildServer();
  let token: string;
  let userId: string;
  let projectId: string;

  before(async () => {
    await app.ready();
    const email = `timeline-test-owner-${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
        name: 'Timeline Tester',
      },
    });
    const authData = JSON.parse(regRes.payload);
    token = authData.token;
    userId = authData.user.id;

    const projRes = await app.inject({
      method: 'POST',
      url: '/api/projects',
      headers: { authorization: `Bearer ${token}` },
      payload: { title: 'Timeline Test Project' },
    });
    const projData = JSON.parse(projRes.payload);
    projectId = projData.project.id;
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { id: userId },
    });
    await app.close();
  });

  it('fetches initial project timeline document', async () => {
    const res = await app.inject({
      method: 'GET',
      url: `/api/projects/${projectId}/timeline`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.timeline);
    assert.strictEqual(body.timeline.version, 1);
    assert.ok(Array.isArray(body.timeline.data.tracks));
  });

  it('autosaves updated timeline document and increments version', async () => {
    const updatedData = {
      version: 2,
      tracks: [
        {
          id: 'track-v1',
          type: 'VIDEO',
          name: 'Video 1',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'clip-auto-1',
              assetId: null,
              name: 'Autosaved Clip',
              start: 0,
              duration: 5,
              inPoint: 0,
              outPoint: 5,
              speed: 1.0,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: null,
            },
          ],
        },
      ],
      markers: [],
      duration: 5,
    };

    const res = await app.inject({
      method: 'PUT',
      url: `/api/projects/${projectId}/timeline`,
      headers: { authorization: `Bearer ${token}` },
      payload: { data: updatedData },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.timeline.version, 2);
  });

  it('creates named version snapshots and lists version history', async () => {
    const snapshotRes = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/timeline/versions`,
      headers: { authorization: `Bearer ${token}` },
      payload: { description: 'Rough Cut Milestone' },
    });

    assert.strictEqual(snapshotRes.statusCode, 201);
    const snapshot = JSON.parse(snapshotRes.payload);
    assert.strictEqual(snapshot.version.description, 'Rough Cut Milestone');

    const listRes = await app.inject({
      method: 'GET',
      url: `/api/projects/${projectId}/timeline/versions`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(listRes.statusCode, 200);
    const listBody = JSON.parse(listRes.payload);
    assert.ok(Array.isArray(listBody.versions));
    assert.ok(listBody.versions.length >= 2); // Initial version + Rough Cut Milestone
  });

  it('restores an earlier timeline snapshot by version number', async () => {
    // Restore initial version 1
    const restoreRes = await app.inject({
      method: 'POST',
      url: `/api/projects/${projectId}/timeline/versions/1/restore`,
      headers: { authorization: `Bearer ${token}` },
    });

    assert.strictEqual(restoreRes.statusCode, 200);
    const body = JSON.parse(restoreRes.payload);
    // When restored, timeline document data matches snapshot 1
    assert.strictEqual(body.timeline.data.tracks[0].clips.length, 0);
  });
});
