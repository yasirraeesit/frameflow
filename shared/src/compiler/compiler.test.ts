import { describe, it } from 'node:test';
import assert from 'node:assert';
import { compileTimelineToFFmpeg } from './ffmpeg-compiler.js';
import { TimelineDocument } from '../timeline/types.js';

describe('Timeline-to-FFmpeg Filtergraph Compiler', () => {
  it('compiles an empty timeline to black canvas and silence of matching duration', () => {
    const emptyTimeline: TimelineDocument = {
      id: 'tl-empty',
      projectId: 'proj-1',
      version: 1,
      fps: 30,
      duration: 10,
      tracks: [
        { id: 'v1', type: 'VIDEO', name: 'Video', locked: false, muted: false, clips: [] },
        { id: 'a1', type: 'AUDIO', name: 'Audio', locked: false, muted: false, clips: [] },
      ],
      markers: [],
    };

    const result = compileTimelineToFFmpeg(emptyTimeline, {}, '1080p_h264');

    assert.strictEqual(result.inputs.length, 0);
    assert.ok(result.filterComplex.includes('color=c=black:s=1920x1080:r=30:d=10'));
    assert.ok(result.filterComplex.includes('anullsrc=channel_layout=stereo:sample_rate=48000:d=10'));
    assert.ok(result.outputOptions.includes('-c:v'));
    assert.ok(result.outputOptions.includes('libx264'));
    assert.ok(result.outputOptions.includes('+faststart'));
  });

  it('compiles single video clip with trim, scale, and base canvas overlay', () => {
    const singleClipTimeline: TimelineDocument = {
      id: 'tl-single',
      projectId: 'proj-1',
      version: 1,
      fps: 30,
      duration: 12,
      tracks: [
        {
          id: 'v1',
          type: 'VIDEO',
          name: 'Video 1',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'c1',
              assetId: 'asset-1',
              name: 'Clip 1',
              start: 2,
              duration: 6,
              inPoint: 1,
              outPoint: 7,
              speed: 1,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: null,
            },
          ],
        },
      ],
      markers: [],
    };

    const assetMap = { 'asset-1': '/path/to/raw-video1.mp4' };
    const result = compileTimelineToFFmpeg(singleClipTimeline, assetMap, '720p_h264');

    assert.strictEqual(result.inputs.length, 1);
    assert.strictEqual(result.inputs[0], '/path/to/raw-video1.mp4');

    // 720p resolution
    assert.ok(result.filterComplex.includes('color=c=black:s=1280x720:r=30:d=12'));
    assert.ok(result.filterComplex.includes('trim=start=1:end=7'));
    assert.ok(result.filterComplex.includes('scale=1280:720'));
    assert.ok(result.filterComplex.includes("enable='between(t,2,8)'"));
  });

  it('compiles audio tracks with atrim and adelay', () => {
    const audioTimeline: TimelineDocument = {
      id: 'tl-audio',
      projectId: 'proj-1',
      version: 1,
      fps: 30,
      duration: 15,
      tracks: [
        {
          id: 'a1',
          type: 'AUDIO',
          name: 'BGM',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'c-audio',
              assetId: 'asset-audio',
              name: 'Music',
              start: 3,
              duration: 5,
              inPoint: 0,
              outPoint: 5,
              speed: 1,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: null,
            },
          ],
        },
      ],
      markers: [],
    };

    const assetMap = { 'asset-audio': '/path/to/music.mp3' };
    const result = compileTimelineToFFmpeg(audioTimeline, assetMap, '1080p_h264');

    assert.strictEqual(result.inputs.length, 1);
    assert.ok(result.filterComplex.includes('atrim=start=0:end=5'));
    assert.ok(result.filterComplex.includes('adelay=3000|3000'));
  });

  it('compiles text overlay clips using drawtext filter', () => {
    const textTimeline: TimelineDocument = {
      id: 'tl-text',
      projectId: 'proj-1',
      version: 1,
      fps: 30,
      duration: 5,
      tracks: [
        {
          id: 't1',
          type: 'TEXT',
          name: 'Titles',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'c-title',
              assetId: null,
              name: 'Title Text',
              start: 1,
              duration: 3,
              inPoint: 0,
              outPoint: 3,
              speed: 1,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: {
                text: 'Welcome to FrameFlow',
                fontSize: 48,
                color: '#ffffff',
                position: { x: 50, y: 50 },
              },
            },
          ],
        },
      ],
      markers: [],
    };

    const result = compileTimelineToFFmpeg(textTimeline, {}, '1080p_h264');
    assert.ok(result.filterComplex.includes('drawtext'));
    assert.ok(result.filterComplex.includes('Welcome to FrameFlow'));
    assert.ok(result.filterComplex.includes('fontsize=48'));
    assert.ok(result.filterComplex.includes("enable='between(t,1,4)'"));
  });

  it('throws descriptive error if clip references an asset missing from assetPathMap', () => {
    const missingAssetTimeline: TimelineDocument = {
      id: 'tl-missing',
      projectId: 'proj-1',
      version: 1,
      fps: 30,
      duration: 5,
      tracks: [
        {
          id: 'v1',
          type: 'VIDEO',
          name: 'Video',
          locked: false,
          muted: false,
          clips: [
            {
              id: 'c-err',
              assetId: 'nonexistent-asset',
              name: 'Missing',
              start: 0,
              duration: 4,
              inPoint: 0,
              outPoint: 4,
              speed: 1,
              proxyUrl: null,
              thumbnailUrl: null,
              textConfig: null,
            },
          ],
        },
      ],
      markers: [],
    };

    assert.throws(
      () => compileTimelineToFFmpeg(missingAssetTimeline, {}, '1080p_h264'),
      /Asset path missing for assetId: nonexistent-asset/
    );
  });
});
