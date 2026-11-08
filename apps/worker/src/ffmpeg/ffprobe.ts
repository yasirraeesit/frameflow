import { execFile } from 'node:child_process';
import { promisify } from 'node:util';

const execFileAsync = promisify(execFile);

export interface ProbeResult {
  duration: number;
  width: number;
  height: number;
  fps: number;
  videoCodec: string | null;
  audioCodec: string | null;
}

export async function probeMedia(filePath: string): Promise<ProbeResult> {
  const args = [
    '-v', 'quiet',
    '-print_format', 'json',
    '-show_format',
    '-show_streams',
    filePath,
  ];

  const { stdout } = await execFileAsync('ffprobe', args);
  const data = JSON.parse(stdout);

  let videoCodec: string | null = null;
  let audioCodec: string | null = null;
  let width = 0;
  let height = 0;
  let fps = 30.0;

  if (Array.isArray(data.streams)) {
    for (const stream of data.streams) {
      if (stream.codec_type === 'video' && !videoCodec) {
        videoCodec = stream.codec_name ?? null;
        width = parseInt(stream.width, 10) || 0;
        height = parseInt(stream.height, 10) || 0;
        if (stream.r_frame_rate) {
          const parts = stream.r_frame_rate.split('/');
          if (parts.length === 2 && parseInt(parts[1], 10) > 0) {
            fps = parseFloat((parseInt(parts[0], 10) / parseInt(parts[1], 10)).toFixed(2));
          }
        }
      } else if (stream.codec_type === 'audio' && !audioCodec) {
        audioCodec = stream.codec_name ?? null;
      }
    }
  }

  const duration = parseFloat(data.format?.duration || '0') || 0;

  return {
    duration,
    width,
    height,
    fps,
    videoCodec,
    audioCodec,
  };
}

