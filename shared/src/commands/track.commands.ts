import { TimelineDocument } from '../timeline/types.js';
import { ICommand } from './command.interface.js';

export class ToggleTrackLockCommand implements ICommand {
  id: string;
  name = 'Toggle Track Lock';

  constructor(public trackId: string) {
    this.id = `toggle-lock-${trackId}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    return {
      ...timeline,
      tracks: timeline.tracks.map((t) => (t.id === this.trackId ? { ...t, locked: !t.locked } : t)),
    };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    return this.execute(timeline); // toggling again restores state
  }
}

export class ToggleTrackMuteCommand implements ICommand {
  id: string;
  name = 'Toggle Track Mute';

  constructor(public trackId: string) {
    this.id = `toggle-mute-${trackId}`;
  }

  execute(timeline: TimelineDocument): TimelineDocument {
    return {
      ...timeline,
      tracks: timeline.tracks.map((t) => (t.id === this.trackId ? { ...t, muted: !t.muted } : t)),
    };
  }

  undo(timeline: TimelineDocument): TimelineDocument {
    return this.execute(timeline);
  }
}
