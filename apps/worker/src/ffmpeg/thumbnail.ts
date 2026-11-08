import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function generateThumbnailStrip(
  inputPath: string,
  outputPath: string,
  duration: number
): Promise<void> {
  // If video is short, sample 5 frames across the duration into a 5x1 tile strip
  const interval = Math.max(0.5, duration / 5);
  const args = [
    '-i', inputPath,
    '-vf', `fps=1/${interval.toFixed(2)},scale=160:90,tile=5x1`,
    '-frames:v', '1',
    '-q:v', '3',
    '-y',
    outputPath,
  ];

  try {
    await execFileAsync('ffmpeg', args);
  } catch {
    // Fallback to single frame snapshot if tile filter fails
    const fallbackArgs = [
      '-ss', '00:00:01',
      '-i', inputPath,
      '-vframes', '1',
      '-vf', 'scale=160:90',
      '-q:v', '3',
      '-y',
      outputPath,
    ];
    await execFileAsync('ffmpeg', fallbackArgs);
  }
}
