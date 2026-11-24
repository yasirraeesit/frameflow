import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export async function generateProxy(inputPath: string, outputPath: string): Promise<void> {
  const args = [
    '-threads', '1',
    '-i', inputPath,
    '-vf', 'scale=-2:720',
    '-c:v', 'libx264',
    '-preset', 'ultrafast',
    '-max_muxing_queue_size', '1024',
    '-crf', '24',
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-y',
    outputPath,
  ];

  await execFileAsync('ffmpeg', args);
}

