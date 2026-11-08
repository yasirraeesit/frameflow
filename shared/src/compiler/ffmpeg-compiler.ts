import { TimelineDocument } from '../timeline/types.js';
import { ExportPreset, PresetConfig, CompilerOutput } from './types.js';

const PRESET_CONFIGS: Record<ExportPreset, PresetConfig> = {
  '1080p_h264': {
    width: 1920,
    height: 1080,
    videoBitrate: '5000k',
    audioBitrate: '192k',
    crf: 22,
  },
  '720p_h264': {
    width: 1280,
    height: 720,
    videoBitrate: '2500k',
    audioBitrate: '128k',
    crf: 23,
  },
};

export function compileTimelineToFFmpeg(
  timeline: TimelineDocument,
  assetPathMap: Record<string, string>,
  preset: ExportPreset
): CompilerOutput {
  const config = PRESET_CONFIGS[preset] || PRESET_CONFIGS['1080p_h264'];
  const width = config.width;
  const height = config.height;
  const fps = timeline.fps || 30;
  const duration = Math.max(0.1, timeline.duration || 1);

  // 1. Collect and index all unique asset filepaths
  const assetPathToInputIndex = new Map<string, number>();
  const inputs: string[] = [];

  const getInputIndexForAsset = (assetId: string): number => {
    const path = assetPathMap[assetId];
    if (!path) {
      throw new Error(`Asset path missing for assetId: ${assetId}`);
    }
    if (!assetPathToInputIndex.has(path)) {
      const idx = inputs.length;
      inputs.push(path);
      assetPathToInputIndex.set(path, idx);
      return idx;
    }
    return assetPathToInputIndex.get(path)!;
  };

  const filtergraphParts: string[] = [];

  // 2. Base black canvas of timeline duration
  filtergraphParts.push(
    `color=c=black:s=${width}x${height}:r=${fps}:d=${duration}[base_v]`
  );

  let currentVideoOut = 'base_v';
  let videoClipCount = 0;

  // 3. Process video tracks (bottom to top overlay)
  const videoTracks = timeline.tracks.filter((t) => t.type === 'VIDEO' && !t.muted);

  for (const track of videoTracks) {
    for (const clip of track.clips) {
      if (!clip.assetId) continue;
      const inputIdx = getInputIndexForAsset(clip.assetId);
      const vclipLabel = `vclip_${videoClipCount}`;
      const vaccumLabel = `vaccum_${videoClipCount}`;

      const trimStart = clip.inPoint;
      const trimEnd = clip.outPoint;
      const start = clip.start;
      const end = clip.start + clip.duration;

      // Trim & scale to fit inside target frame with letterbox/pillarbox padding
      filtergraphParts.push(
        `[${inputIdx}:v]trim=start=${trimStart}:end=${trimEnd},setpts=PTS-STARTPTS,` +
          `scale=${width}:${height}:force_original_aspect_ratio=decrease,` +
          `pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2[${vclipLabel}]`
      );

      // Overlay on top of current video canvas
      filtergraphParts.push(
        `[${currentVideoOut}][${vclipLabel}]overlay=x=0:y=0:enable='between(t,${start},${end})'[${vaccumLabel}]`
      );

      currentVideoOut = vaccumLabel;
      videoClipCount++;
    }
  }

  // 4. Process text overlays
  const textTracks = timeline.tracks.filter((t) => t.type === 'TEXT' && !t.muted);
  let textCount = 0;

  for (const track of textTracks) {
    for (const clip of track.clips) {
      if (!clip.textConfig) continue;
      const { text, fontSize, color, position } = clip.textConfig;
      const start = clip.start;
      const end = clip.start + clip.duration;
      const textLabel = `vtext_${textCount}`;

      // Escape special characters in text for drawtext
      const escapedText = text
        .replace(/\\/g, '\\\\')
        .replace(/'/g, "\\'")
        .replace(/:/g, '\\:');

      const posX = position.x / 100;
      const posY = position.y / 100;

      filtergraphParts.push(
        `[${currentVideoOut}]drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${color}:` +
          `x=(w*${posX})-(tw/2):y=(h*${posY})-(th/2):enable='between(t,${start},${end})'[${textLabel}]`
      );

      currentVideoOut = textLabel;
      textCount++;
    }
  }

  // 5. Process audio tracks & video clip audio
  const audioClipLabels: string[] = [];
  let audioClipCount = 0;

  const audioTracks = timeline.tracks.filter((t) => t.type === 'AUDIO' && !t.muted);

  for (const track of audioTracks) {
    for (const clip of track.clips) {
      if (!clip.assetId) continue;
      const inputIdx = getInputIndexForAsset(clip.assetId);
      const aclipLabel = `aclip_${audioClipCount}`;
      const delayMs = Math.round(clip.start * 1000);

      filtergraphParts.push(
        `[${inputIdx}:a]atrim=start=${clip.inPoint}:end=${clip.outPoint},asetpts=PTS-STARTPTS,` +
          `adelay=${delayMs}|${delayMs}[${aclipLabel}]`
      );

      audioClipLabels.push(`[${aclipLabel}]`);
      audioClipCount++;
    }
  }

  // Also extract audio from unmuted video tracks if present
  for (const track of videoTracks) {
    for (const clip of track.clips) {
      if (!clip.assetId) continue;
      const inputIdx = getInputIndexForAsset(clip.assetId);
      const aclipLabel = `aclip_${audioClipCount}`;
      const delayMs = Math.round(clip.start * 1000);

      filtergraphParts.push(
        `[${inputIdx}:a]atrim=start=${clip.inPoint}:end=${clip.outPoint},asetpts=PTS-STARTPTS,` +
          `adelay=${delayMs}|${delayMs}[${aclipLabel}]`
      );

      audioClipLabels.push(`[${aclipLabel}]`);
      audioClipCount++;
    }
  }

  // Audio mix or silence
  let currentAudioOut = 'aout';
  if (audioClipLabels.length > 0) {
    filtergraphParts.push(
      `${audioClipLabels.join('')}amix=inputs=${audioClipLabels.length}:dropout_transition=0:normalize=0[aout]`
    );
  } else {
    filtergraphParts.push(
      `anullsrc=channel_layout=stereo:sample_rate=48000:d=${duration}[aout]`
    );
  }

  const filterComplex = filtergraphParts.join(';\n');

  const outputOptions = [
    '-map',
    `[${currentVideoOut}]`,
    '-map',
    `[${currentAudioOut}]`,
    '-c:v',
    'libx264',
    '-preset',
    'fast',
    '-crf',
    config.crf.toString(),
    '-b:v',
    config.videoBitrate,
    '-pix_fmt',
    'yuv420p',
    '-c:a',
    'aac',
    '-b:a',
    config.audioBitrate,
    '-movflags',
    '+faststart',
  ];

  return {
    inputs,
    filterComplex,
    outputOptions,
  };
}
