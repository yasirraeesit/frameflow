import { describe, it } from 'node:test';
import assert from 'node:assert';
import { findSnapTime, collectSnapTargets } from './snapping.js';
import { useTimelineStore } from './timeline.store.js';
import { TimelineDocument, AddClipCommand, SplitClipCommand } from '@frameflow/shared';

const mockTimeline: TimelineDocument = {
  id: 'timeline-1',
  projectId: 'project-1',
  version: 1,
  fps: 30,
  duration: 20,
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
          name: 'Clip 1',
          start: 2,
          duration: 5, // ends at 7
          inPoint: 0,
          outPoint: 5,
          speed: 1,
          proxyUrl: null,
          thumbnailUrl: null,
          textConfig: null,
        },
        {
          id: 'clip-2',
          assetId: 'asset-2',
          name: 'Clip 2',
          start: 10,
          duration: 4, // ends at 14
          inPoint: 0,
          outPoint: 4,
          speed: 1,
          proxyUrl: null,
          thumbnailUrl: null,
          textConfig: null,
        },
      ],
    },
    {
      id: 'track-a1',
      type: 'AUDIO',
      name: 'Audio 1',
      locked: false,
      muted: false,
      clips: [],
    },
  ],
  markers: [
    { id: 'm-1', time: 15, label: 'Intro End', color: '#ff0000' },
  ],
};

describe('Timeline Snapping Engine', () => {
  it('collects snap targets including origin, playhead, clip edges, and markers', () => {
    const playhead = 8.5;
    const targets = collectSnapTargets(mockTimeline, playhead);

    // Should include: 0 (origin), 8.5 (playhead), 2 (clip-1 start), 7 (clip-1 end), 10 (clip-2 start), 14 (clip-2 end), 15 (marker)
    assert.ok(targets.includes(0));
    assert.ok(targets.includes(8.5));
    assert.ok(targets.includes(2));
    assert.ok(targets.includes(7));
    assert.ok(targets.includes(10));
    assert.ok(targets.includes(14));
    assert.ok(targets.includes(15));
  });

  it('excludes target clip being dragged from its own snap targets', () => {
    const targets = collectSnapTargets(mockTimeline, 0, 'clip-1');
    assert.strictEqual(targets.includes(2), false);
    assert.strictEqual(targets.includes(7), false);
    assert.ok(targets.includes(10));
  });

  it('snaps candidate time to nearest target within threshold', () => {
    const targets = [0, 2, 7, 10, 14, 15];
    const threshold = 0.2; // 200ms

    // 6.9 is within 0.2 of 7
    const result1 = findSnapTime(6.9, targets, threshold);
    assert.strictEqual(result1.isSnapped, true);
    assert.strictEqual(result1.snappedTime, 7);

    // 7.3 is outside threshold 0.2 of 7
    const result2 = findSnapTime(7.3, targets, threshold);
    assert.strictEqual(result2.isSnapped, false);
    assert.strictEqual(result2.snappedTime, 7.3);
  });
});

describe('Zustand Timeline Store', () => {
  it('initializes with timeline and manages playback and zoom state', () => {
    const store = useTimelineStore.getState();
    store.setTimeline(mockTimeline);

    assert.strictEqual(useTimelineStore.getState().timeline?.id, 'timeline-1');

    store.setPlayhead(4.5);
    assert.strictEqual(useTimelineStore.getState().playhead, 4.5);

    store.togglePlay();
    assert.strictEqual(useTimelineStore.getState().isPlaying, true);
    store.togglePlay();
    assert.strictEqual(useTimelineStore.getState().isPlaying, false);

    store.setZoom(100);
    assert.strictEqual(useTimelineStore.getState().zoom, 100);
  });

  it('executes commands and tracks undo/redo and dirty state', () => {
    const store = useTimelineStore.getState();
    store.setTimeline(mockTimeline);

    assert.strictEqual(useTimelineStore.getState().canUndo(), false);
    assert.strictEqual(useTimelineStore.getState().canRedo(), false);

    // Add a clip via command
    const newClip = {
      id: 'clip-3',
      assetId: null,
      name: 'Audio Track Clip',
      start: 0,
      duration: 6,
      inPoint: 0,
      outPoint: 6,
      speed: 1,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: null,
    };
    store.executeCommand(new AddClipCommand('track-a1', newClip));

    // Clip should now be in track-a1
    const tlAfterAdd = useTimelineStore.getState().timeline!;
    const audioTrack = tlAfterAdd.tracks.find((t) => t.id === 'track-a1')!;
    assert.strictEqual(audioTrack.clips.length, 1);
    assert.strictEqual(useTimelineStore.getState().isDirty, true);
    assert.strictEqual(useTimelineStore.getState().canUndo(), true);

    // Undo command
    store.undo();
    const tlAfterUndo = useTimelineStore.getState().timeline!;
    const audioTrackAfterUndo = tlAfterUndo.tracks.find((t) => t.id === 'track-a1')!;
    assert.strictEqual(audioTrackAfterUndo.clips.length, 0);
    assert.strictEqual(useTimelineStore.getState().canUndo(), false);
    assert.strictEqual(useTimelineStore.getState().canRedo(), true);

    // Redo command
    store.redo();
    const tlAfterRedo = useTimelineStore.getState().timeline!;
    const audioTrackAfterRedo = tlAfterRedo.tracks.find((t) => t.id === 'track-a1')!;
    assert.strictEqual(audioTrackAfterRedo.clips.length, 1);
  });

  it('splits clip and tracks undo/redo in store', () => {
    const store = useTimelineStore.getState();
    store.setTimeline(mockTimeline);

    // Split clip-1 (starts at 2, duration 5 -> ends at 7) at time 4
    store.executeCommand(new SplitClipCommand('track-v1', 'clip-1', 4, 'clip-1-right'));

    const tl = useTimelineStore.getState().timeline!;
    const videoTrack = tl.tracks.find((t) => t.id === 'track-v1')!;
    assert.strictEqual(videoTrack.clips.length, 3); // clip-1 was split into 2, plus clip-2 = 3

    store.undo();
    const tlUndone = useTimelineStore.getState().timeline!;
    const videoTrackUndone = tlUndone.tracks.find((t) => t.id === 'track-v1')!;
    assert.strictEqual(videoTrackUndone.clips.length, 2);
  });
});
