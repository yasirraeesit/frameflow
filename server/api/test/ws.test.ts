import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { JobProgressEvent } from '@frameflow/shared';

describe('WebSocket Job Progress Gateway', () => {
  const app = buildServer();
  let serverPort: number;

  before(async () => {
    // Listen on random port
    const address = await app.listen({ port: 0, host: '127.0.0.1' });
    const url = new URL(address);
    serverPort = parseInt(url.port, 10);
  });

  after(async () => {
    await app.close();
  });

  it('connects to /ws, subscribes to project, and receives progress events', async () => {
    const projectId = `proj-ws-test-${Date.now()}`;
    const wsUrl = `ws://127.0.0.1:${serverPort}/ws`;

    const ws = new WebSocket(wsUrl);

    await new Promise<void>((resolve, reject) => {
      ws.onopen = () => resolve();
      ws.onerror = (err) => reject(err);
    });

    // Send subscribe message
    ws.send(JSON.stringify({ type: 'subscribe', projectId }));

    // Wait a brief tick for subscription registration
    await new Promise((r) => setTimeout(r, 100));

    // Now publish an event to Redis pub/sub channel for this project
    const eventPayload: JobProgressEvent = {
      jobId: 'job-ws-1',
      projectId,
      assetId: 'asset-ws-1',
      type: 'PROXY_GENERATION',
      status: 'PROCESSING',
      progress: 60,
      message: 'Generating proxy video',
    };

    const receivedPromise = new Promise<JobProgressEvent>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('Timeout waiting for WS message')), 4000);
      ws.onmessage = (msgEvent) => {
        clearTimeout(timer);
        try {
          const parsed = JSON.parse(msgEvent.data.toString());
          resolve(parsed);
        } catch (e) {
          reject(e);
        }
      };
    });

    await app.redis.publish(`events:project:${projectId}`, JSON.stringify(eventPayload));

    const received = await receivedPromise;
    assert.strictEqual(received.jobId, 'job-ws-1');
    assert.strictEqual(received.progress, 60);
    assert.strictEqual(received.status, 'PROCESSING');
    assert.strictEqual(received.message, 'Generating proxy video');

    ws.close();
  });
});

