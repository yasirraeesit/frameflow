import { TimelineDocument } from '../timeline/types.js';

export interface ICommand {
  id: string;
  name: string;
  execute(timeline: TimelineDocument): TimelineDocument;
  undo(timeline: TimelineDocument): TimelineDocument;
}

export function computeTimelineDuration(timeline: TimelineDocument): number {
  let maxEnd = 0;
  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      const end = clip.start + clip.duration;
      if (end > maxEnd) maxEnd = end;
    }
  }
  return parseFloat(maxEnd.toFixed(3));
}
