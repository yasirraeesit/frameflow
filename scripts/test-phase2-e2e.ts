import { buildServer } from '../server/api/src/server.js';
import { prisma } from '@frameflow/database';
import {
  TimelineDocument,
  CommandHistory,
  AddClipCommand,
  TrimClipCommand,
  SplitClipCommand,
  MoveClipCommand,
  Clip,
} from '@frameflow/shared';
import assert from 'node:assert';

async function runPhase2E2E() {
  console.log('====================================================');
  console.log('   FRAMEFLOW PHASE 2: TIMELINE EDITOR E2E TEST      ');
  console.log('====================================================');

  const app = buildServer();
  const address = await app.listen({ port: 4002, host: '127.0.0.1' });
  console.log(`[E2E] API Server running for test at ${address}`);

  let userId: string | null = null;

  try {
    // 1. Auth: Register user
    const email = `phase2-tester-${Date.now()}@example.com`;
    console.log(`[E2E Step 1] Registering user ${email}...`);
    const regRes = await fetch('http://127.0.0.1:4002/api/auth/register', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email,
        password: 'password123',
        name: 'Phase 2 Editor Tester',
      }),
    });
    assert.strictEqual(regRes.status, 201, 'User registration must succeed');
    const { token, user } = await regRes.json();
    userId = user.id;
    console.log(`[E2E Step 1 PASS] User registered: ${userId}`);

    // 2. Create Project
    console.log('[E2E Step 2] Creating project with initial timeline document...');
    const projRes = await fetch('http://127.0.0.1:4002/api/projects', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        title: 'Action Sequence Cut',
        description: 'Multi-track timeline editing test project',
        fps: 30,
        width: 1920,
        height: 1080,
      }),
    });
    assert.strictEqual(projRes.status, 201, 'Project creation must succeed');
    const { project } = await projRes.json();
    const projectId = project.id;
    console.log(`[E2E Step 2 PASS] Project created: ${projectId}`);

    // 3. Fetch Initial Timeline Document
    console.log('[E2E Step 3] Fetching initial timeline document...');
    const tlRes = await fetch(`http://127.0.0.1:4002/api/projects/${projectId}/timeline`, {
      headers: { authorization: `Bearer ${token}` },
    });
    assert.strictEqual(tlRes.status, 200, 'Timeline fetch must succeed');
    const tlBody = await tlRes.json();
    let currentDoc: TimelineDocument = tlBody.timeline.data;
    assert.strictEqual(currentDoc.tracks.length, 3, 'Initial document must have 3 tracks (V, A, T)');
    assert.strictEqual(currentDoc.tracks[0].clips.length, 0, 'Initial tracks must be empty');
    console.log(`[E2E Step 3 PASS] Initial timeline document validated: version ${tlBody.timeline.version}`);

    // 4. Command Pattern Execution & History Engine
    console.log('[E2E Step 4] Executing non-destructive Command Pattern operations...');
    const history = new CommandHistory();
    const videoTrackId = currentDoc.tracks[0].id;

    // Command 1: Add Clip (0s to 10s)
    const clip1: Clip = {
      id: 'clip-alpha',
      assetId: 'asset-fake-1',
      name: 'Hero Shot',
      start: 0,
      duration: 10,
      inPoint: 0,
      outPoint: 10,
      speed: 1,
      proxyUrl: 'http://localhost:9000/proxies/test.mp4',
      thumbnailUrl: null,
      textConfig: null,
    };
    currentDoc = history.execute(new AddClipCommand(videoTrackId, clip1), currentDoc);
    assert.strictEqual(currentDoc.tracks[0].clips.length, 1);
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 10);
    console.log('  [PASS] AddClipCommand applied (duration: 10s)');

    // Command 2: Trim Clip (trim out-point to 8s)
    currentDoc = history.execute(
      new TrimClipCommand(videoTrackId, 'clip-alpha', {
        start: 0,
        duration: 8,
        inPoint: 0,
        outPoint: 8,
      }),
      currentDoc
    );
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 8);
    console.log('  [PASS] TrimClipCommand applied (duration trimmed from 10s -> 8s)');

    // Command 3: Split Clip at 3s into two sub-clips
    currentDoc = history.execute(
      new SplitClipCommand(videoTrackId, 'clip-alpha', 3, 'clip-alpha-right'),
      currentDoc
    );
    assert.strictEqual(currentDoc.tracks[0].clips.length, 2);
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 3);
    assert.strictEqual(currentDoc.tracks[0].clips[1].start, 3);
    assert.strictEqual(currentDoc.tracks[0].clips[1].duration, 5); // 8 - 3 = 5
    console.log('  [PASS] SplitClipCommand applied (split into 3s and 5s clips)');

    // Command 4: Move right sub-clip from 3s to 6s
    currentDoc = history.execute(
      new MoveClipCommand(videoTrackId, videoTrackId, 'clip-alpha-right', 6),
      currentDoc
    );
    assert.strictEqual(currentDoc.tracks[0].clips[1].start, 6);
    console.log('  [PASS] MoveClipCommand applied (right clip moved to 6s)');

    // 5. Test Non-Destructive Undo Cycle
    console.log('[E2E Step 5] Verifying 4-level Undo sequence...');
    // Undo Move
    currentDoc = history.undo(currentDoc);
    assert.strictEqual(currentDoc.tracks[0].clips[1].start, 3, 'Undo Move must restore start at 3s');

    // Undo Split
    currentDoc = history.undo(currentDoc);
    assert.strictEqual(currentDoc.tracks[0].clips.length, 1, 'Undo Split must merge back to 1 clip');
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 8, 'Undo Split must restore 8s duration');

    // Undo Trim
    currentDoc = history.undo(currentDoc);
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 10, 'Undo Trim must restore 10s duration');

    // Undo Add
    currentDoc = history.undo(currentDoc);
    assert.strictEqual(currentDoc.tracks[0].clips.length, 0, 'Undo Add must restore empty track');
    console.log('[E2E Step 5 PASS] All 4 Undo operations verified without state corruption!');

    // 6. Test Non-Destructive Redo Cycle
    console.log('[E2E Step 6] Verifying 4-level Redo sequence...');
    currentDoc = history.redo(currentDoc); // Redo Add
    assert.strictEqual(currentDoc.tracks[0].clips.length, 1);
    currentDoc = history.redo(currentDoc); // Redo Trim
    assert.strictEqual(currentDoc.tracks[0].clips[0].duration, 8);
    currentDoc = history.redo(currentDoc); // Redo Split
    assert.strictEqual(currentDoc.tracks[0].clips.length, 2);
    currentDoc = history.redo(currentDoc); // Redo Move
    assert.strictEqual(currentDoc.tracks[0].clips[1].start, 6);
    console.log('[E2E Step 6 PASS] All 4 Redo operations restored exact state!');

    // 7. Autosave Timeline to Database
    console.log('[E2E Step 7] Autosaving current timeline document to PostgreSQL...');
    const saveRes = await fetch(`http://127.0.0.1:4002/api/projects/${projectId}/timeline`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ data: currentDoc }),
    });
    assert.strictEqual(saveRes.status, 200, 'Autosave must succeed');
    const saveBody = await saveRes.json();
    assert.strictEqual(saveBody.timeline.version, 2, 'Autosave must increment timeline version to 2');
    console.log(`[E2E Step 7 PASS] Autosaved to PostgreSQL: version ${saveBody.timeline.version}`);

    // 8. Create Milestone Snapshot (Version 2)
    console.log('[E2E Step 8] Creating named version snapshot "Director Rough Cut"...');
    const snapshotRes = await fetch(
      `http://127.0.0.1:4002/api/projects/${projectId}/timeline/versions`,
      {
        method: 'POST',
        headers: {
          authorization: `Bearer ${token}`,
          'content-type': 'application/json',
        },
        body: JSON.stringify({ description: 'Director Rough Cut' }),
      }
    );
    assert.strictEqual(snapshotRes.status, 201, 'Snapshot creation must succeed');
    const snapshotBody = await snapshotRes.json();
    assert.strictEqual(snapshotBody.version.version, 2);
    console.log(`[E2E Step 8 PASS] Snapshot created: "${snapshotBody.version.description}" (v2)`);

    // 9. Mutate Timeline with Audio Track Clip & Save Version 3
    console.log('[E2E Step 9] Mutating timeline and saving Version 3...');
    const audioTrackId = currentDoc.tracks[1].id;
    const audioClip: Clip = {
      id: 'clip-bgm',
      assetId: null,
      name: 'Dramatic Score',
      start: 0,
      duration: 15,
      inPoint: 0,
      outPoint: 15,
      speed: 1,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: null,
    };
    currentDoc = history.execute(new AddClipCommand(audioTrackId, audioClip), currentDoc);

    const saveV3Res = await fetch(`http://127.0.0.1:4002/api/projects/${projectId}/timeline`, {
      method: 'PUT',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ data: currentDoc }),
    });
    const saveV3Body = await saveV3Res.json();
    assert.strictEqual(saveV3Body.timeline.version, 3);
    console.log(`[E2E Step 9 PASS] Mutated timeline saved as version 3 with audio track`);

    // 10. List Version History
    console.log('[E2E Step 10] Listing version history...');
    const listRes = await fetch(
      `http://127.0.0.1:4002/api/projects/${projectId}/timeline/versions`,
      {
        headers: { authorization: `Bearer ${token}` },
      }
    );
    assert.strictEqual(listRes.status, 200);
    const listBody = await listRes.json();
    assert.ok(listBody.versions.length >= 2, 'Must list at least initial snapshot + rough cut');
    console.log(`[E2E Step 10 PASS] Found ${listBody.versions.length} version snapshots in history`);

    // 11. Restore Snapshot Version 2
    console.log('[E2E Step 11] Restoring snapshot Version 2 (reverting audio mutation)...');
    const restoreRes = await fetch(
      `http://127.0.0.1:4002/api/projects/${projectId}/timeline/versions/2/restore`,
      {
        method: 'POST',
        headers: { authorization: `Bearer ${token}` },
      }
    );
    assert.strictEqual(restoreRes.status, 200, 'Version restore must succeed');
    const restoreBody = await restoreRes.json();
    const restoredDoc: TimelineDocument = restoreBody.timeline.data;

    // Verify audio track in restored document is empty again
    assert.strictEqual(restoredDoc.tracks[1].clips.length, 0, 'Audio track clips must be reverted to 0');
    // Verify video track clips are preserved
    assert.strictEqual(restoredDoc.tracks[0].clips.length, 2, 'Video track clips must match v2 snapshot');
    console.log(`[E2E Step 11 PASS] Successfully restored to Version 2 snapshot!`);

    console.log('====================================================');
    console.log('   >>> PHASE 2 E2E VERIFICATION COMPLETED: 100% PASS <<<');
    console.log('====================================================');
  } finally {
    if (userId) {
      await prisma.user.deleteMany({ where: { id: userId } });
    }
    await app.close();
  }
}

void runPhase2E2E();
