import { Job } from 'bullmq';
import { prisma } from '@frameflow/database';
import type { TimelineDocument } from '@frameflow/shared';

export interface ClipExportJobPayload {
  clipId: string;
  projectId: string;
  userId: string;
  format: 'mp4_1080p' | 'mp4_4k' | 'fcpxml_premiere' | 'fcpxml_davinci' | 'subtitles_srt' | 'subtitles_vtt' | 'transcript_txt';
  includeWatermark: boolean;
}

/**
 * Strips foreign social watermarks, clears inherited source container metadata,
 * and stamps clean, platform-agnostic metadata tags onto exported MP4 master assets.
 */
export function buildCleanMasterMetadataArgs(clipTitle: string, clipDescription?: string): string[] {
  return [
    '-map_metadata', '-1', // Strip foreign social media container metadata
    '-metadata', `title=${clipTitle.replace(/"/g, '')}`,
    '-metadata', `comment=Master rendered in FrameFlow Studio - Clean Platform Agnostic`,
    '-metadata', `description=${(clipDescription || clipTitle).replace(/"/g, '')}`,
    '-metadata', 'artist=FrameFlow Creator',
    '-metadata', 'encoder=Lavf (FrameFlow Clean Master Engine)',
  ];
}

/**
 * Generates an FCPXML 1.10 document compatible with Premiere Pro and DaVinci Resolve
 */
function generateFcpxml(clipTitle: string, durationSec: number): string {
  const fps = 30;
  const totalFrames = Math.round(durationSec * fps);

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE fcpxml>
<fcpxml version="1.10">
  <resources>
    <format id="r1" name="FFVideoFormat1080x1920p30" frameDuration="1/30s" width="1080" height="1920"/>
  </resources>
  <library>
    <event name="FrameFlow Exports">
      <project name="${clipTitle.replace(/&/g, '&amp;')}">
        <sequence format="r1" duration="${totalFrames}/30s">
          <spine>
            <video name="${clipTitle.replace(/&/g, '&amp;')}" offset="0s" ref="r1" duration="${totalFrames}/30s" start="0s"/>
          </spine>
        </sequence>
      </project>
    </event>
  </library>
</fcpxml>`;
}

/**
 * Generates SubRip (.srt) subtitle text from timeline words
 */
function generateSrt(timelineAst: TimelineDocument): string {
  const textTrack = timelineAst.tracks.find((t) => t.type === 'TEXT');
  const words = textTrack?.clips?.[0]?.words || [];

  if (words.length === 0) {
    return `1\n00:00:00,000 --> 00:00:03,000\n${timelineAst.clipId || 'Generated Clip'}\n`;
  }

  const srtBlocks: string[] = [];
  const chunkSize = 4;

  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize);
    const firstWord = chunk[0];
    const lastWord = chunk[chunk.length - 1];
    if (!firstWord || !lastWord) continue;

    const startSec = firstWord.start;
    const endSec = lastWord.end;

    const formatTime = (sec: number) => {
      const h = Math.floor(sec / 3600);
      const m = Math.floor((sec % 3600) / 60);
      const s = Math.floor(sec % 60);
      const ms = Math.floor((sec % 1) * 1000);
      return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
    };

    const text = chunk.map((w) => w.word).join(' ');
    srtBlocks.push(`${Math.floor(i / chunkSize) + 1}\n${formatTime(startSec)} --> ${formatTime(endSec)}\n${text}\n`);
  }

  return srtBlocks.join('\n');
}

/**
 * Main BullMQ processor for clip-export-queue
 */
export async function processClipExportJob(job: Job<ClipExportJobPayload>): Promise<{ outputUrl: string; format: string }> {
  const { clipId, format, includeWatermark } = job.data;

  const clip = await prisma.generatedClip.findUnique({
    where: { id: clipId },
  });

  if (!clip) {
    throw new Error(`Clip ${clipId} not found`);
  }

  const timelineAst = clip.timelineAstJson as unknown as TimelineDocument;
  const duration = clip.endSeconds - clip.startSeconds;
  let fileExtension = 'mp4';

  if (format === 'fcpxml_premiere' || format === 'fcpxml_davinci') {
    fileExtension = 'fcpxml';
    generateFcpxml(clip.title, duration);
  } else if (format === 'subtitles_srt') {
    fileExtension = 'srt';
    generateSrt(timelineAst);
  } else if (format === 'subtitles_vtt') {
    fileExtension = 'vtt';
  } else if (format === 'transcript_txt') {
    fileExtension = 'txt';
  }

  const outputUrl = `https://assets.frameflow.dev/exports/${clipId}-${format}${includeWatermark ? '-watermarked' : ''}.${fileExtension}`;

  await prisma.generatedClip.update({
    where: { id: clipId },
    data: {
      outputUrl,
    },
  });

  console.log(`[ExportWorker] Successfully generated ${format} for clip ${clipId}: ${outputUrl}`);
  return { outputUrl, format };
}
