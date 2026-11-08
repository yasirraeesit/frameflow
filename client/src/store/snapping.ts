import { TimelineDocument } from '@frameflow/shared';

export interface SnapResult {
  snappedTime: number;
  isSnapped: boolean;
}

/**
 * Collects potential snap points from timeline:
 * - 0 (timeline beginning)
 * - Playhead position
 * - Clip start and end points across all tracks (excluding a specified clip being dragged/trimmed)
 * - Markers
 */
export function collectSnapTargets(
  timeline: TimelineDocument,
  playhead: number,
  excludeClipId?: string
): number[] {
  const targets = new Set<number>();

  targets.add(0);
  if (playhead >= 0) {
    targets.add(playhead);
  }

  for (const track of timeline.tracks) {
    for (const clip of track.clips) {
      if (clip.id === excludeClipId) continue;
      targets.add(clip.start);
      targets.add(clip.start + clip.duration);
    }
  }

  for (const marker of timeline.markers) {
    targets.add(marker.time);
  }

  return Array.from(targets).sort((a, b) => a - b);
}

/**
 * Finds the closest snap target within threshold (in seconds).
 */
export function findSnapTime(
  candidateTime: number,
  snapTargets: number[],
  thresholdSeconds: number
): SnapResult {
  if (thresholdSeconds <= 0 || snapTargets.length === 0) {
    return { snappedTime: candidateTime, isSnapped: false };
  }

  let closestTarget: number | null = null;
  let minDiff = Infinity;

  for (const target of snapTargets) {
    const diff = Math.abs(candidateTime - target);
    if (diff <= thresholdSeconds && diff < minDiff) {
      minDiff = diff;
      closestTarget = target;
    }
  }

  if (closestTarget !== null) {
    return { snappedTime: closestTarget, isSnapped: true };
  }

  return { snappedTime: candidateTime, isSnapped: false };
}
