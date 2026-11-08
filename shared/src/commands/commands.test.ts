import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TimelineDocument, Clip } from '../timeline/types.js';
import { CommandHistory } from './history.js';
import {
  AddClipCommand,
  MoveClipCommand,
  TrimClipCommand,
  SplitClipCommand,
  DeleteClipCommand,
} from './clip.commands.js';
import { CompositeCommand } from './composite.command.js';

function createMockTimeline(): TimelineDocument {
  return {
    id: 'tl-1',
    projectId: 'p-1',
    version: 1,
    fps: 30,
    duration: 0,
    tracks: [
      { id: 'v1', type: 'VIDEO', name: 'Video 1', locked: false, muted: false, clips: [] },
      { id: 'a1', type: 'AUDIO', name: 'Audio 1', locked: false, muted: false, clips: [] },
    ],
    markers: [],
  };
}

const mockClip: Clip = {
  id: 'c1',
  assetId: 'a1',
  name: 'Clip 1',
  start: 0,
  duration: 10,
  inPoint: 0,
  outPoint: 10,
  speed: 1.0,
  proxyUrl: null,
  thumbnailUrl: null,
  textConfig: null,
};

describe('Command Pattern & Undo/Redo Engine', () => {
  it('AddClipCommand adds clip and undo removes it', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();

    const cmd = new AddClipCommand('v1', mockClip);
    timeline = history.execute(cmd, timeline);

    assert.strictEqual(timeline.tracks[0]?.clips.length, 1);
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.id, 'c1');
    assert.strictEqual(timeline.duration, 10);
    assert.strictEqual(history.canUndo, true);

    // Undo
    timeline = history.undo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 0);
    assert.strictEqual(timeline.duration, 0);

    // Redo
    timeline = history.redo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 1);
    assert.strictEqual(timeline.duration, 10);
  });

  it('MoveClipCommand repositions clip and undo restores it', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();
    timeline = history.execute(new AddClipCommand('v1', mockClip), timeline);

    const moveCmd = new MoveClipCommand('v1', 'v1', 'c1', 5);
    timeline = history.execute(moveCmd, timeline);

    assert.strictEqual(timeline.tracks[0]?.clips[0]?.start, 5);
    assert.strictEqual(timeline.duration, 15);

    // Undo
    timeline = history.undo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.start, 0);
    assert.strictEqual(timeline.duration, 10);
  });

  it('TrimClipCommand adjusts in/out points non-destructively and undo restores', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();
    timeline = history.execute(new AddClipCommand('v1', mockClip), timeline);

    // Trim left edge: start moves from 0 to 2, inPoint from 0 to 2, duration becomes 8
    const trimLeftCmd = new TrimClipCommand('v1', 'c1', {
      start: 2,
      duration: 8,
      inPoint: 2,
      outPoint: 10,
    });
    timeline = history.execute(trimLeftCmd, timeline);

    const trimmed = timeline.tracks[0]?.clips[0];
    assert.strictEqual(trimmed?.start, 2);
    assert.strictEqual(trimmed?.duration, 8);
    assert.strictEqual(trimmed?.inPoint, 2);
    assert.strictEqual(trimmed?.outPoint, 10);

    // Undo
    timeline = history.undo(timeline);
    const restored = timeline.tracks[0]?.clips[0];
    assert.strictEqual(restored?.start, 0);
    assert.strictEqual(restored?.duration, 10);
    assert.strictEqual(restored?.inPoint, 0);
  });

  it('SplitClipCommand divides a clip at playhead time into two adjacent clips', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();
    timeline = history.execute(new AddClipCommand('v1', mockClip), timeline);

    // Split at playhead = 4 seconds
    const splitCmd = new SplitClipCommand('v1', 'c1', 4, 'c1-split-right');
    timeline = history.execute(splitCmd, timeline);

    const clips = timeline.tracks[0]?.clips || [];
    assert.strictEqual(clips.length, 2);

    const left = clips[0];
    assert.strictEqual(left?.id, 'c1');
    assert.strictEqual(left?.start, 0);
    assert.strictEqual(left?.duration, 4);
    assert.strictEqual(left?.inPoint, 0);
    assert.strictEqual(left?.outPoint, 4);

    const right = clips[1];
    assert.strictEqual(right?.id, 'c1-split-right');
    assert.strictEqual(right?.start, 4);
    assert.strictEqual(right?.duration, 6);
    assert.strictEqual(right?.inPoint, 4);
    assert.strictEqual(right?.outPoint, 10);

    // Undo restores the single united clip
    timeline = history.undo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 1);
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.id, 'c1');
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.duration, 10);
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.outPoint, 10);
  });

  it('DeleteClipCommand removes clip and undo restores it', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();
    timeline = history.execute(new AddClipCommand('v1', mockClip), timeline);

    const delCmd = new DeleteClipCommand('v1', 'c1');
    timeline = history.execute(delCmd, timeline);

    assert.strictEqual(timeline.tracks[0]?.clips.length, 0);

    timeline = history.undo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 1);
    assert.strictEqual(timeline.tracks[0]?.clips[0]?.id, 'c1');
  });

  it('CompositeCommand executes batch of commands and undos them in one atomic step', () => {
    let timeline = createMockTimeline();
    const history = new CommandHistory();

    const clip2: Clip = { ...mockClip, id: 'c2', start: 10 };
    const composite = new CompositeCommand('Batch Insert 2 Clips', [
      new AddClipCommand('v1', mockClip),
      new AddClipCommand('v1', clip2),
    ]);

    timeline = history.execute(composite, timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 2);

    // 1 Undo reverts BOTH clips
    timeline = history.undo(timeline);
    assert.strictEqual(timeline.tracks[0]?.clips.length, 0);
  });
});

