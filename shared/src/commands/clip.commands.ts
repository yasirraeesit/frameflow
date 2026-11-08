import { Clip, TimelineDocument } from '../timeline/types.js';
import { ICommand, computeTimelineDuration } from './command.interface.js';

export class AddClipCommand implements ICommand {
  id: string;
  name = 'Add Clip';

  constructor(
    public trackId: string,
    public clip: Clip
  ) {
    this.id = `add-${clip.id}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;
      return {
        ...track,
        clips: [...track.clips, { ...this.clip }].sort((a, b) => a.start - b.start),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;
      return {
        ...track,
        clips: track.clips.filter((c) => c.id !== this.clip.id),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }
}

export class MoveClipCommand implements ICommand {
  id: string;
  name = 'Move Clip';
  private previousTrackId: string;
  private previousStart: number;

  constructor(
    public sourceTrackId: string,
    public targetTrackId: string,
    public clipId: string,
    public newStart: number
  ) {
    this.id = `move-${clipId}`;
    this.previousTrackId = sourceTrackId;
    this.previousStart = 0;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    let targetClip: Clip | null = null;

    // 1. Find and remove clip from source track
    const tracksWithoutClip = timeline.tracks.map((track) => {
      if (track.id === this.sourceTrackId) {
        const found = track.clips.find((c) => c.id === this.clipId);
        if (found) {
          targetClip = { ...found };
          this.previousStart = found.start;
          this.previousTrackId = track.id;
        }
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== this.clipId),
        };
      }
      return track;
    });

    if (!targetClip) return timeline;

    const movedClip: Clip = {
      ...(targetClip as Clip),
      start: Math.max(0, this.newStart),
    };

    // 2. Add to target track
    const finalTracks = tracksWithoutClip.map((track) => {
      if (track.id === this.targetTrackId) {
        return {
          ...track,
          clips: [...track.clips, movedClip].sort((a, b) => a.start - b.start),
        };
      }
      return track;
    });

    const updated = { ...timeline, tracks: finalTracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    let targetClip: Clip | null = null;

    // Remove from target track
    const tracksWithoutClip = timeline.tracks.map((track) => {
      if (track.id === this.targetTrackId) {
        const found = track.clips.find((c) => c.id === this.clipId);
        if (found) targetClip = { ...found };
        return {
          ...track,
          clips: track.clips.filter((c) => c.id !== this.clipId),
        };
      }
      return track;
    });

    if (!targetClip) return timeline;

    const restoredClip: Clip = {
      ...(targetClip as Clip),
      start: this.previousStart,
    };

    const finalTracks = tracksWithoutClip.map((track) => {
      if (track.id === this.previousTrackId) {
        return {
          ...track,
          clips: [...track.clips, restoredClip].sort((a, b) => a.start - b.start),
        };
      }
      return track;
    });

    const updated = { ...timeline, tracks: finalTracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }
}

export interface TrimParams {
  start: number;
  duration: number;
  inPoint: number;
  outPoint: number;
}

export class TrimClipCommand implements ICommand {
  id: string;
  name = 'Trim Clip';
  private previousParams: TrimParams | null = null;

  constructor(
    public trackId: string,
    public clipId: string,
    public newParams: TrimParams
  ) {
    this.id = `trim-${clipId}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;
      return {
        ...track,
        clips: track.clips.map((clip) => {
          if (clip.id !== this.clipId) return clip;
          if (!this.previousParams) {
            this.previousParams = {
              start: clip.start,
              duration: clip.duration,
              inPoint: clip.inPoint,
              outPoint: clip.outPoint,
            };
          }
          return {
            ...clip,
            start: this.newParams.start,
            duration: this.newParams.duration,
            inPoint: this.newParams.inPoint,
            outPoint: this.newParams.outPoint,
          };
        }),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    if (!this.previousParams) return timeline;

    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;
      return {
        ...track,
        clips: track.clips.map((clip) => {
          if (clip.id !== this.clipId) return clip;
          return {
            ...clip,
            start: this.previousParams!.start,
            duration: this.previousParams!.duration,
            inPoint: this.previousParams!.inPoint,
            outPoint: this.previousParams!.outPoint,
          };
        }),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }
}

export class SplitClipCommand implements ICommand {
  id: string;
  name = 'Split Clip';
  private originalClip: Clip | null = null;

  constructor(
    public trackId: string,
    public clipId: string,
    public splitTime: number,
    public newRightClipId: string
  ) {
    this.id = `split-${clipId}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;

      const clip = track.clips.find((c) => c.id === this.clipId);
      if (!clip) return track;

      this.originalClip = { ...clip };

      const splitOffset = this.splitTime - clip.start;
      if (splitOffset <= 0 || splitOffset >= clip.duration) {
        return track; // Split point outside clip boundaries
      }

      // Left piece
      const leftClip: Clip = {
        ...clip,
        duration: splitOffset,
        outPoint: clip.inPoint + splitOffset * clip.speed,
      };

      // Right piece
      const rightClip: Clip = {
        ...clip,
        id: this.newRightClipId,
        start: this.splitTime,
        duration: clip.duration - splitOffset,
        inPoint: clip.inPoint + splitOffset * clip.speed,
        outPoint: clip.outPoint,
      };

      const newClips = track.clips
        .filter((c) => c.id !== this.clipId)
        .concat([leftClip, rightClip])
        .sort((a, b) => a.start - b.start);

      return {
        ...track,
        clips: newClips,
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    if (!this.originalClip) return timeline;

    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;

      const restoredClips = track.clips
        .filter((c) => c.id !== this.clipId && c.id !== this.newRightClipId)
        .concat([{ ...this.originalClip! }])
        .sort((a, b) => a.start - b.start);

      return {
        ...track,
        clips: restoredClips,
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }
}

export class DeleteClipCommand implements ICommand {
  id: string;
  name = 'Delete Clip';
  private deletedClip: Clip | null = null;

  constructor(
    public trackId: string,
    public clipId: string
  ) {
    this.id = `delete-${clipId}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;

      const clip = track.clips.find((c) => c.id === this.clipId);
      if (clip) {
        this.deletedClip = { ...clip };
      }

      return {
        ...track,
        clips: track.clips.filter((c) => c.id !== this.clipId),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    if (!this.deletedClip) return timeline;

    const tracks = timeline.tracks.map((track) => {
      if (track.id !== this.trackId || track.locked) return track;

      return {
        ...track,
        clips: [...track.clips, { ...this.deletedClip! }].sort((a, b) => a.start - b.start),
      };
    });

    const updated = { ...timeline, tracks };
    return { ...updated, duration: computeTimelineDuration(updated) };
  }
}

