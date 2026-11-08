import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TimelineDocumentSchema, ClipSchema } from './schema.js';
import { TimelineDocument } from './types.js';

describe('Timeline Document Schema & Validation', () => {
  it('validates a complete timeline document with tracks and clips', () => {
    const doc: TimelineDocument = {
      id: 'timeline-1',
      projectId: 'project-1',
      version: 1,
      fps: 30,
      duration: 10,
      tracks: [
        {
          id: 'track-v1',
          type: 'VIDEO',
          name: 'Video 1',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'clip-1',
              assetId: 'asset-1',
              name: 'Interview Scene',
              start: 0,
              duration: 5,
              inPoint: 0,
              outPoint: 5,
              speed: 1.0,
              proxyUrl: 'http://localhost:9000/proxies/p1.mp4',
              thumbnailUrl: 'http://localhost:9000/thumbnails/t1.jpg',
              textConfig: null,
            },
          ],
        },
      ],
      markers: [
        {
          id: 'm-1',
          time: 2.5,
          label: 'Good quote',
          color: '#3b82f6',
        },
      ],
    };

    const parsed = TimelineDocumentSchema.safeParse(doc);
    assert.strictEqual(parsed.success, true);
  });

  it('rejects clips with negative start or duration', () => {
    const invalidClip = {
      id: 'clip-bad',
      assetId: 'asset-1',
      name: 'Bad Clip',
      start: -1,
      duration: -5,
      inPoint: 0,
      outPoint: 5,
      speed: 1.0,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: null,
    };

    const res = ClipSchema.safeParse(invalidClip);
    assert.strictEqual(res.success, false);
  });
});
