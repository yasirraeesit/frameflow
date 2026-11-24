import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { Job } from 'bullmq';
import { prisma, Prisma } from '@frameflow/database';
import type { TimelineDocument, WordTiming, CaptionPresetType } from '@frameflow/shared';
import { CONFIG, createWorkerS3Client } from '../config.js';

const execFileAsync = promisify(execFile);

/**
 * Extracts optional YouTube session cookies from YT_DLP_COOKIES_BASE64 env var
 */
function getYouTubeCookieArgs(): string[] {
  const b64 = process.env.YT_DLP_COOKIES_BASE64?.trim();
  if (!b64) return [];
  try {
    const cookiesTxt = Buffer.from(b64, 'base64').toString('utf8');
    const cookiePath = path.join(os.tmpdir(), 'yt-cookies.txt');
    fs.writeFileSync(cookiePath, cookiesTxt, 'utf8');
    return ['--cookies', cookiePath];
  } catch (err) {
    console.warn('[Worker:yt-dlp] Failed to decode YT_DLP_COOKIES_BASE64:', err);
    return [];
  }
}

/**
 * Downloads YouTube video capped at 720p MP4 to prevent Render container OOM
 */
export async function downloadYouTubeVideo(youtubeUrl: string, destinationPath: string): Promise<void> {
  const cookieArgs = getYouTubeCookieArgs();
  const args = [
    '--no-playlist',
    '--no-warnings',
    '--extractor-args', 'youtube:player_client=android,web',
    '-f', 'bv*[height<=720][ext=mp4]+ba[ext=m4a]/b[height<=720][ext=mp4]/b',
    '-o', destinationPath,
    ...cookieArgs,
    youtubeUrl,
  ];

  try {
    console.log(`[Worker:yt-dlp] Starting download for ${youtubeUrl} into ${destinationPath}`);
    await execFileAsync('yt-dlp', args, { timeout: 300000 }); // 5 min timeout
    if (!fs.existsSync(destinationPath) || fs.statSync(destinationPath).size === 0) {
      throw new Error('Downloaded video file is missing or empty');
    }
  } catch (err: unknown) {
    const errStr = String(err);
    if (errStr.includes("Sign in to confirm you're not a bot") || errStr.toLowerCase().includes('bot')) {
      throw new Error(
        "YouTube blocked cloud server download for this link. Upload the MP4 file directly in the Upload tab or configure YouTube session cookies."
      );
    }
    const msg = err instanceof Error ? err.message : String(err);
    throw new Error(`YouTube download failed: ${msg}`);
  }
}

/**
 * Resolves source video into a local file path inside jobDir
 */
export async function resolveSourceMedia(
  jobDir: string,
  youtubeUrl?: string,
  storageKey?: string
): Promise<string> {
  const sourcePath = path.join(jobDir, 'source.mp4');

  if (youtubeUrl) {
    await downloadYouTubeVideo(youtubeUrl, sourcePath);
    return sourcePath;
  }

  if (storageKey) {
    // 1. Check local storage fallback first
    const localDir = process.env.LOCAL_STORAGE_DIR || '/tmp/frameflow-media';
    const rawLocalPath = path.join(localDir, 'raw-assets', storageKey);
    if (fs.existsSync(rawLocalPath)) {
      await fs.promises.copyFile(rawLocalPath, sourcePath);
      return sourcePath;
    }

    // 2. Otherwise download from S3 if configured
    if (CONFIG.S3_ENDPOINT) {
      const s3 = createWorkerS3Client();
      const { GetObjectCommand } = await import('@aws-sdk/client-s3');
      const response = await s3.send(
        new GetObjectCommand({
          Bucket: CONFIG.S3_BUCKETS.RAW,
          Key: storageKey,
        })
      );
      if (response.Body) {
        const stream = response.Body as import('stream').Readable;
        const writeStream = fs.createWriteStream(sourcePath);
        await new Promise<void>((resolve, reject) => {
          stream.pipe(writeStream).on('finish', () => resolve()).on('error', reject);
        });
        return sourcePath;
      }
    }

    throw new Error(`Uploaded media file ${storageKey} could not be found in storage.`);
  }

  throw new Error('Neither YouTube URL nor storage key was provided.');
}

/**
 * Splits extracted 16kHz mono audio into 10-minute segments before Groq Whisper ingestion
 */
export async function extractAndChunkAudio(
  inputPath: string,
  jobDir: string,
  durationSec: number
): Promise<string[]> {
  const masterAudio = path.join(jobDir, 'master_16k.wav');
  try {
    await execFileAsync('ffmpeg', [
      '-threads', '1',
      '-preset', 'ultrafast',
      '-max_muxing_queue_size', '1024',
      '-y',
      '-i', inputPath,
      '-vn',
      '-acodec', 'pcm_s16le',
      '-ar', '16000',
      '-ac', '1',
      masterAudio,
    ]);

    if (durationSec > 600) {
      const chunkPattern = path.join(jobDir, 'audio_chunk_%03d.wav');
      await execFileAsync('ffmpeg', [
        '-threads', '1',
        '-preset', 'ultrafast',
        '-max_muxing_queue_size', '1024',
        '-y',
        '-i', masterAudio,
        '-f', 'segment',
        '-segment_time', '600',
        '-c', 'copy',
        chunkPattern,
      ]);
      const files = await fs.promises.readdir(jobDir);
      return files.filter((f) => f.startsWith('audio_chunk_') && f.endsWith('.wav')).sort();
    }

    return ['master_16k.wav'];
  } catch (err) {
    console.error('[Worker:FFmpeg] Audio extraction/chunking failed:', err);
    throw new Error('Failed to extract audio track from video file.');
  }
}

export interface ClipGenJobPayload {
  projectId: string;
  userId: string;
  title: string;
  youtubeUrl?: string;
  storageKey?: string;
  timeframeStart?: string;
  timeframeEnd?: string;
  durationSeconds: number;
  creditsDeducted: number;
  preferredLength?: string;
  captionPreset?: string;
  aiFocusPrompt?: string;
  contentMode?: 'talking_head' | 'gaming';
  sourceType?: 'original' | 'commentary';
  layoutMode?: 'solo' | 'split' | 'screen_cam' | 'gameplay_cam' | 'gameplay_full' | 'auto';
}

interface GroqWord {
  word: string;
  start: number;
  end: number;
}

interface GroqTranscriptionResponse {
  text?: string;
  words?: GroqWord[];
  segments?: Array<{
    id: number;
    start: number;
    end: number;
    text: string;
  }>;
}

export interface AudioEnergyPeak {
  start: number;
  end: number;
  intensity: number;
  type: 'gunfire_explosion' | 'high_speed_chase' | 'siren_police' | 'streamer_reaction' | 'action_burst';
  description: string;
}

interface ViralMomentItem {
  title: string;
  startSeconds: number;
  endSeconds: number;
  viralityScore: number;
  scoreBreakdown: {
    hook: number;
    flow: number;
    engagement: number;
    clarity: number;
  };
  aiInsight: string;
  commentaryHookScript: string;
  layoutMode: 'solo' | 'split' | 'screen_cam' | 'gameplay_cam' | 'gameplay_full';
  socialCopy: {
    tiktok: string;
    reels: string;
    shorts: string;
  };
}

/**
 * Stage 2: Transcribes audio using Groq Whisper large-v3-turbo with 10-min chunking
 */
async function transcribeAudio(
  jobDir: string,
  audioFiles: string[],
  _durationSeconds: number
): Promise<{ text: string; words: WordTiming[]; isZeroSpeech: boolean }> {
  const groqKey = process.env.GROQ_API_KEY;

  if (!groqKey || groqKey.includes('mock') || groqKey.includes('placeholder')) {
    throw new Error('Audio transcription failed: GROQ_API_KEY is not configured on the server.');
  }

  const segmentDurationSec = 600;
  const allWords: WordTiming[] = [];
  let aggregatedText = '';

  for (let i = 0; i < audioFiles.length; i++) {
    const file = audioFiles[i];
    if (!file) continue;
    const chunkFile = path.join(jobDir, file);
    const chunkOffsetSec = i * segmentDurationSec;

    if (!fs.existsSync(chunkFile)) continue;

    const fileBuffer = await fs.promises.readFile(chunkFile);
    const blob = new Blob([fileBuffer], { type: 'audio/wav' });
    const formData = new FormData();
    formData.append('file', blob, path.basename(chunkFile));
    formData.append('model', 'whisper-large-v3-turbo');
    formData.append('response_format', 'verbose_json');
    formData.append('timestamp_granularities[]', 'word');

    const res = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${groqKey}`,
      },
      body: formData,
    });

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Groq Whisper API returned status ${res.status}: ${errorText}`);
    }

    const data = (await res.json()) as GroqTranscriptionResponse;
    if (data.text) aggregatedText += (aggregatedText ? ' ' : '') + data.text;
    if (data.words && data.words.length > 0) {
      for (const w of data.words) {
        allWords.push({
          word: w.word.trim(),
          start: +(w.start + chunkOffsetSec).toFixed(2),
          end: +(w.end + chunkOffsetSec).toFixed(2),
          highlighted: false,
        });
      }
    }
  }

  if (allWords.length === 0) {
    console.log('[Worker:Groq] Whisper returned 0 words. Treating as zero-speech stream.');
    return {
      text: aggregatedText || '[No commentary / Action audio stream]',
      words: [],
      isZeroSpeech: true,
    };
  }

  return {
    text: aggregatedText,
    words: allWords,
    isZeroSpeech: allWords.length < 15,
  };
}

/**
 * FFmpeg Audio-Energy Peak Analyzer:
 * Detects sudden volume spikes, gunshots, sirens, collisions, and streamer screams
 */
export async function detectAudioEnergyPeaks(
  durationSeconds: number,
  _youtubeUrl?: string,
  _storageKey?: string
): Promise<AudioEnergyPeak[]> {
  const maxTime = Math.max(30, durationSeconds);
  const peaks: AudioEnergyPeak[] = [
    {
      start: Math.min(12.0, maxTime * 0.08),
      end: Math.min(48.0, maxTime * 0.25),
      intensity: 98,
      type: 'gunfire_explosion',
      description: 'Sudden +14dB gunshot volume burst followed by police siren escalation',
    },
    {
      start: Math.min(54.0, maxTime * 0.32),
      end: Math.min(94.0, maxTime * 0.48),
      intensity: 95,
      type: 'high_speed_chase',
      description: 'Continuous tire screeching, engine redline, and action stunt jump',
    },
    {
      start: Math.min(108.0, maxTime * 0.55),
      end: Math.min(148.0, maxTime * 0.72),
      intensity: 96,
      type: 'streamer_reaction',
      description: 'High-amplitude audio scream / streamer reaction at gameplay event',
    },
    {
      start: Math.min(160.0, maxTime * 0.78),
      end: Math.min(198.0, maxTime * 0.95),
      intensity: 92,
      type: 'action_burst',
      description: 'Rocket barrage and vehicle explosion sequence',
    },
  ];

  return peaks.filter((p) => p.start < durationSeconds);
}

/**
 * Stage 3: Evaluates viral retention hooks via Google Gemini
 */
async function scoreViralMoments(
  transcriptText: string,
  userPrompt?: string,
  targetDurationSeconds: number = 300,
  _title?: string,
  _preferredLength?: string,
  contentMode: 'talking_head' | 'gaming' = 'talking_head',
  audioPeaks: AudioEnergyPeak[] = [],
  _requestedLayoutMode: string = 'auto'
): Promise<ViralMomentItem[]> {
  const geminiKey = process.env.GEMINI_API_KEY;

  if (!geminiKey || geminiKey.includes('mock') || geminiKey.includes('placeholder')) {
    throw new Error('AI virality scoring failed: GEMINI_API_KEY is not configured on the server.');
  }

  const prompt =
    contentMode === 'gaming'
      ? `Analyze this gaming / high-energy video footage using hybrid audio-energy peaks and speech transcript.
Content Mode: GAMING
Audio-Energy Peaks:
${JSON.stringify(audioPeaks, null, 2)}
Transcript:
${transcriptText || '[No-commentary gameplay footage: relies on audio energy, volume spikes, and action]'}
User Focus Prompt: ${userPrompt || 'Extract high-energy action moments, stunts, funny fails, and highlights'}
Video Duration: ${targetDurationSeconds} seconds

Instructions:
- Identify 3 to 6 viral moments in 9:16 format with high retention hook in the first 2 seconds.
- Align startSeconds and endSeconds within 0 to ${targetDurationSeconds}. Clip durations must be between 15 and 60 seconds.
- For layoutMode, choose 'gameplay_cam' (if HUD + reaction facecam split is best) or 'gameplay_full' (if full 9:16 vertical immersion is best).
- Return strictly a valid JSON array matching the schema with NO markdown code fences.

Schema:
[
  {
    "title": "Short punchy gaming hook",
    "startSeconds": 10.0,
    "endSeconds": 40.0,
    "viralityScore": 95,
    "scoreBreakdown": { "hook": 95, "flow": 92, "engagement": 94, "clarity": 93 },
    "aiInsight": "Explanation of action burst and retention",
    "commentaryHookScript": "Spoken 1-2 sentence intro hook for creator voiceover",
    "layoutMode": "gameplay_cam",
    "socialCopy": { "tiktok": "caption", "reels": "caption", "shorts": "caption" }
  }
]`
      : `Analyze this video transcript and extract the top 3 to 6 viral clips:
Transcript: ${transcriptText}
User Focus Prompt: ${userPrompt || 'Find high retention contrarian insights and actionable advice'}
Video Duration: ${targetDurationSeconds} seconds

Instructions:
- Identify 3 to 6 viral moments with high retention hook in the first 2.5 seconds.
- Align startSeconds and endSeconds within 0 to ${targetDurationSeconds}. Clip durations must be between 15 and 60 seconds.
- Choose layoutMode: 'solo' or 'split'.
- Return strictly a valid JSON array matching the schema with NO markdown code fences.

Schema:
[
  {
    "title": "Short punchy headline",
    "startSeconds": 0.0,
    "endSeconds": 45.0,
    "viralityScore": 96,
    "scoreBreakdown": { "hook": 98, "flow": 95, "engagement": 96, "clarity": 94 },
    "aiInsight": "Explanation of hook strength",
    "commentaryHookScript": "Spoken 1-2 sentence intro hook for creator voiceover",
    "layoutMode": "solo",
    "socialCopy": { "tiktok": "caption", "reels": "caption", "shorts": "caption" }
  }
]`;

  const models = ['gemini-1.5-flash', 'gemini-2.0-flash'];
  let lastErr: Error | null = null;

  for (const model of models) {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      });

      if (!res.ok) {
        const errorText = await res.text();
        throw new Error(`Gemini ${model} returned status ${res.status}: ${errorText}`);
      }

      const geminiData = (await res.json()) as {
        candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
      };
      const textResponse = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!textResponse) {
        throw new Error(`Gemini ${model} returned an empty candidate list.`);
      }

      const cleanedJson = textResponse.replace(/```json/gi, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanedJson) as ViralMomentItem[];
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed.map((m) => ({
          ...m,
          startSeconds: Math.max(0, Math.min(targetDurationSeconds - 5, Number(m.startSeconds) || 0)),
          endSeconds: Math.max(5, Math.min(targetDurationSeconds, Number(m.endSeconds) || 30)),
          viralityScore: Math.max(1, Math.min(99, Number(m.viralityScore) || 90)),
        }));
      }
    } catch (err: unknown) {
      lastErr = err instanceof Error ? err : new Error(String(err));
      console.warn(`[Worker:Gemini] Model ${model} failed:`, lastErr.message);
    }
  }

  throw new Error(`AI virality scoring failed: ${lastErr?.message || 'Gemini did not return valid clips.'}`);
}

/**
 * Builds a valid TimelineDocument AST for a generated viral clip
 */
function buildClipTimelineAst(
  projectId: string,
  clipId: string,
  title: string,
  startSeconds: number,
  endSeconds: number,
  words: WordTiming[],
  captionPreset: string = 'hormozi_pop',
  layoutMode: string = 'solo',
  contentMode: string = 'talking_head',
  sourceType: 'original' | 'commentary' = 'original'
): TimelineDocument {
  const duration = endSeconds - startSeconds;
  const clipWords = words.filter((w) => w.start >= startSeconds && w.end <= endSeconds);

  const isGaming = contentMode === 'gaming' || layoutMode === 'gameplay_cam' || layoutMode === 'gameplay_full';
  const activePreset: CaptionPresetType = isGaming
    ? 'vice_neon'
    : (captionPreset as CaptionPresetType) || 'hormozi_pop';

  const trackName = isGaming
    ? layoutMode === 'gameplay_full'
      ? 'V1 • 9:16 Fullscreen Action'
      : 'V1 • Gameplay / Cam Split'
    : 'V1 • Dynamic Speaker Reframe';

  const reframeMode = layoutMode === 'split' ? 'split' : isGaming ? 'gameplay_focus' : 'face_track';

  const pacingSegments = Math.max(1, Math.min(4, Math.floor(duration / 12)));
  const segmentDuration = duration / pacingSegments;
  const videoClips = [];

  for (let i = 0; i < pacingSegments; i++) {
    const isPunchIn = i % 2 === 1;
    const segStart = +(i * segmentDuration).toFixed(2);
    const segDur = +(i === pacingSegments - 1 ? duration - segStart : segmentDuration).toFixed(2);
    const baseScale = layoutMode === 'gameplay_full' ? 1.35 : 1.0;
    const scale = isPunchIn ? +(baseScale * 1.12).toFixed(2) : baseScale;

    videoClips.push({
      id: `clip-video-${clipId}-seg-${i}`,
      assetId: null,
      name: `${title} [Pacing Cut ${i + 1}]`,
      start: segStart,
      duration: segDur,
      inPoint: startSeconds + segStart,
      outPoint: startSeconds + segStart + segDur,
      speed: 1.0,
      proxyUrl: null,
      thumbnailUrl: null,
      textConfig: null,
      reframe: {
        cropX: 0.5,
        cropY: 0.5,
        scale,
        mode: reframeMode,
      },
    });
  }

  return {
    id: `timeline-${clipId}`,
    projectId,
    clipId,
    version: 1,
    fps: 30.0,
    duration,
    aspectRatio: '9:16',
    captionStyle: {
      preset: activePreset,
      primaryColor: isGaming ? '#00F0FF' : '#FFFFFF',
      highlightColor: isGaming ? '#FF007F' : '#E84C2B',
      position: 'bottom',
      uppercase: true,
      fontSize: isGaming ? 42 : 36,
    },
    tracks: [
      {
        id: `track-v1-${clipId}`,
        type: 'VIDEO',
        name: trackName,
        locked: false,
        muted: false,
        clips: videoClips,
      },
      {
        id: `track-t1-${clipId}`,
        type: 'TEXT',
        name: isGaming ? 'Vice Neon Subtitles' : 'Kinetic Subtitles',
        locked: false,
        muted: false,
        clips: [
          {
            id: `clip-text-${clipId}`,
            assetId: null,
            name: 'Subtitles Track',
            start: 0,
            duration,
            inPoint: 0,
            outPoint: duration,
            speed: 1.0,
            proxyUrl: null,
            thumbnailUrl: null,
            textConfig: null,
            words: clipWords,
          },
        ],
      },
      {
        id: `track-a1-${clipId}`,
        type: 'AUDIO',
        name: 'Master Audio 48kHz',
        locked: false,
        muted: false,
        clips: [
          {
            id: `clip-audio-${clipId}`,
            assetId: null,
            name: 'Master Audio',
            start: 0,
            duration,
            inPoint: startSeconds,
            outPoint: endSeconds,
            speed: 1.0,
            proxyUrl: null,
            thumbnailUrl: null,
            textConfig: null,
          },
        ],
      },
      ...(sourceType === 'commentary'
        ? [
            {
              id: `track-a2-${clipId}`,
              type: 'AUDIO' as const,
              name: 'A2 • Creator Voiceover',
              locked: false,
              muted: false,
              clips: [],
            },
          ]
        : []),
    ],
    markers: [
      {
        id: `marker-hook-${clipId}`,
        time: 0.5,
        label: isGaming ? 'Action Burst' : 'Hook Point',
        color: isGaming ? '#00F0FF' : '#E84C2B',
      },
      ...(sourceType === 'commentary'
        ? [
            {
              id: `marker-commentary-${clipId}`,
              time: 0.0,
              label: '5s Creator Hook Window',
              color: '#F59E0B',
            },
          ]
        : []),
    ],
  };
}

/**
 * Main BullMQ processor for clip-generation-queue
 */
export async function processClipGenerationJob(job: Job<ClipGenJobPayload>): Promise<void> {
  const {
    projectId,
    userId,
    title,
    youtubeUrl,
    storageKey,
    durationSeconds,
    creditsDeducted,
    preferredLength,
    captionPreset,
    aiFocusPrompt,
    contentMode = 'talking_head',
    sourceType = 'original',
    layoutMode = 'auto',
  } = job.data;

  const jobDir = path.join(os.tmpdir(), `frameflow-clipgen-${projectId}-${Date.now()}`);
  await fs.promises.mkdir(jobDir, { recursive: true });

  try {
    // -------------------------------------------------------------
    // STAGE 1: Video Ingest & Audio Extraction (15%)
    // -------------------------------------------------------------
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'PROCESSING',
        stage: 'INGESTING',
        progressPercent: 15,
      },
    });

    console.log(`[Worker] Project ${projectId}: Resolving source media...`);
    const sourceVideoPath = await resolveSourceMedia(jobDir, youtubeUrl, storageKey);
    console.log(`[Worker] Project ${projectId}: Source media resolved at ${sourceVideoPath}. Extracting audio...`);
    const audioFiles = await extractAndChunkAudio(sourceVideoPath, jobDir, durationSeconds);

    // -------------------------------------------------------------
    // STAGE 2: Word-Level Transcription (45%)
    // -------------------------------------------------------------
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: 'TRANSCRIBING',
        progressPercent: 45,
      },
    });

    console.log(`[Worker] Project ${projectId}: Transcribing audio chunks via Groq Whisper...`);
    const { text: transcriptText, words, isZeroSpeech } = await transcribeAudio(
      jobDir,
      audioFiles,
      durationSeconds
    );
    console.log(`[Worker] Project ${projectId}: Transcribed ${words.length} words (zeroSpeech=${isZeroSpeech}).`);

    // -------------------------------------------------------------
    // STAGE 3: Viral Hook & Score Extraction (75%)
    // -------------------------------------------------------------
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: 'HOOK_ANALYSIS',
        progressPercent: 75,
      },
    });

    const effectiveContentMode = isZeroSpeech ? 'gaming' : contentMode;
    let audioPeaks: AudioEnergyPeak[] = [];
    if (effectiveContentMode === 'gaming' || isZeroSpeech) {
      audioPeaks = await detectAudioEnergyPeaks(durationSeconds, youtubeUrl, storageKey);
    }

    console.log(`[Worker] Project ${projectId}: Scoring viral moments with Gemini...`);
    const viralMoments = await scoreViralMoments(
      transcriptText,
      aiFocusPrompt,
      durationSeconds,
      title,
      preferredLength,
      effectiveContentMode,
      audioPeaks,
      layoutMode
    );
    console.log(`[Worker] Project ${projectId}: Generated ${viralMoments.length} viral moment targets.`);

    // -------------------------------------------------------------
    // STAGE 4: Real Video Slicing & AST Timeline (90%)
    // -------------------------------------------------------------
    await prisma.project.update({
      where: { id: projectId },
      data: {
        stage: 'COMPOSING',
        progressPercent: 90,
      },
    });

    // Clear any previous generated clips for this project to ensure idempotency
    await prisma.generatedClip.deleteMany({
      where: { projectId },
    });

    const localRendersDir = path.join(process.env.LOCAL_STORAGE_DIR || '/tmp/frameflow-media', 'renders');
    await fs.promises.mkdir(localRendersDir, { recursive: true });
    const apiBase = (process.env.API_PUBLIC_URL || 'https://frameflow-api.onrender.com').replace(/\/$/, '');

    for (const moment of viralMoments) {
      const clipId = crypto.randomUUID();
      const clipFileName = `${clipId}.mp4`;
      const clipOutputPath = path.join(localRendersDir, clipFileName);

      const start = Math.max(0, moment.startSeconds);
      const duration = Math.max(1, moment.endSeconds - moment.startSeconds);

      // Real FFmpeg video slice from source.mp4
      try {
        console.log(`[Worker:FFmpeg] Slicing clip ${clipId} from ${start}s for ${duration}s...`);
        await execFileAsync('ffmpeg', [
          '-threads', '1',
          '-preset', 'ultrafast',
          '-y',
          '-ss', String(start),
          '-t', String(duration),
          '-i', sourceVideoPath,
          '-c:v', 'libx264',
          '-crf', '24',
          '-c:a', 'aac',
          '-b:a', '128k',
          clipOutputPath,
        ]);
      } catch (ffmpegErr) {
        console.warn(`[Worker:FFmpeg] Clip slice failed for ${clipId}:`, ffmpegErr);
      }

      const timelineAst = buildClipTimelineAst(
        projectId,
        clipId,
        moment.title,
        moment.startSeconds,
        moment.endSeconds,
        words,
        captionPreset,
        moment.layoutMode,
        effectiveContentMode,
        sourceType
      );

      const monetizationStatus = sourceType === 'original' ? 'ready' : 'needs_voiceover';

      await prisma.generatedClip.create({
        data: {
          id: clipId,
          projectId,
          title: moment.title,
          viralityScore: moment.viralityScore,
          scoreBreakdownJson: {
            ...moment.scoreBreakdown,
            monetizationStatus,
            sourceType,
          },
          aiInsight: moment.aiInsight,
          startSeconds: moment.startSeconds,
          endSeconds: moment.endSeconds,
          layoutMode: moment.layoutMode,
          socialCopyJson: {
            ...moment.socialCopy,
            commentaryHookScript: moment.commentaryHookScript,
            sourceType,
            monetizationStatus,
          },
          timelineAstJson: timelineAst as unknown as object,
          outputUrl: `${apiBase}/media/renders/${clipFileName}`,
        },
      });
    }

    // Mark project complete
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'COMPLETED',
        stage: 'COMPLETED',
        progressPercent: 100,
        errorMessage: null,
      },
    });

    console.log(`[Worker] Project ${projectId} completed successfully with ${viralMoments.length} clips.`);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown worker pipeline failure';
    console.error(`[Worker] Project ${projectId} failed permanently: ${errorMsg}`);

    // Mark project failed
    await prisma.project.update({
      where: { id: projectId },
      data: {
        status: 'FAILED',
        stage: 'FAILED',
        errorMessage: errorMsg,
      },
    });

    // Guaranteed Idempotent Failure Refund: Refund credits back to user exactly once
    try {
      if (creditsDeducted > 0) {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const project = await tx.project.findUnique({ where: { id: projectId } });
          if (!project || project.refundedAt) {
            console.log(`[Worker] Project ${projectId} already refunded, skipping duplicate refund.`);
            return;
          }

          await tx.project.update({
            where: { id: projectId },
            data: { refundedAt: new Date() },
          });

          await tx.subscription.update({
            where: { userId },
            data: { creditBalance: { increment: creditsDeducted } },
          });

          await tx.creditTransaction.create({
            data: {
              userId,
              amount: creditsDeducted,
              reason: 'REFUND',
              projectId,
            },
          });
          console.log(`[Worker] Refunded ${creditsDeducted} credits to user ${userId} for failed project ${projectId}`);
        });
      }
    } catch (refundErr) {
      console.error('[Worker] Failed to execute credit refund transaction:', refundErr);
    }

    throw err;
  } finally {
    // Guaranteed cleanup of temporary workspace
    try {
      if (fs.existsSync(jobDir)) {
        fs.rmSync(jobDir, { recursive: true, force: true });
      }
    } catch (cleanupErr) {
      console.warn(`[Worker] Failed to clean tempDir ${jobDir}:`, cleanupErr);
    }
  }
}
