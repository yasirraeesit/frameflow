/**
 * Formats a time in seconds to standard SMPTE timecode string HH:MM:SS:FF
 */
export function formatTimecode(seconds: number, fps = 30): string {
  const safeSeconds = Math.max(0, seconds);
  const totalFrames = Math.round(safeSeconds * fps);

  const hours = Math.floor(totalFrames / (fps * 3600));
  const minutes = Math.floor((totalFrames % (fps * 3600)) / (fps * 60));
  const secs = Math.floor((totalFrames % (fps * 60)) / fps);
  const frames = totalFrames % fps;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(secs)}:${pad(frames)}`;
}

/**
 * Formats seconds to human readable MM:SS.ms
 */
export function formatDuration(seconds: number): string {
  const safeSeconds = Math.max(0, seconds);
  const minutes = Math.floor(safeSeconds / 60);
  const secs = Math.floor(safeSeconds % 60);
  const ms = Math.floor((safeSeconds % 1) * 10);

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(minutes)}:${pad(secs)}.${ms}s`;
}
