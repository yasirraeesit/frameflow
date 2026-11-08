import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function generateProxy(inputPath: string, outputPath: string): Promise<void> {
  const args = [
    '-i', inputPath,
    '-vf', 'scale=-2:720',
    '-c:v', 'libx264',
    '-preset', 'veryfast',
    '-crf', '24',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ];

  await execFileAsync('ffmpeg', args);
}

