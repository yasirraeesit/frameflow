import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { PrismaClient } from '@frameflow/database';
import {
  CreateProjectInput,
  UpdateProjectInput,
  IngestProjectInput,
  ClipExportInput,
} from '@frameflow/shared';
import { getClipGenerationQueue } from '../../queues/clip-generation.queue.js';
import { getClipExportQueue } from '../../queues/clip-export.queue.js';

const execFileAsync = promisify(execFile);

export function isValidYouTubeUrl(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.replace(/^www\./, '');
    if (host === 'youtu.be') {
      return /^\/[a-zA-Z0-9_-]{11}$/.test(parsed.pathname);
    }
    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname === '/watch') {
        const v = parsed.searchParams.get('v');
        return !!v && /^[a-zA-Z0-9_-]{11}$/.test(v);
      }
      if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/live/')) {
        const id = parsed.pathname.split('/')[2];
        return !!id && /^[a-zA-Z0-9_-]{11}$/.test(id);
      }
    }
    return false;
  } catch {
    return false;
  }
}

export interface YouTubePreflightResult {
  durationSec: number;
  title?: string;
  isLive: boolean;
}

export async function inspectYouTubeVideo(url: string): Promise<YouTubePreflightResult> {
  if (!isValidYouTubeUrl(url)) {
    const err = new Error('INVALID_YOUTUBE_URL');
    (err as unknown as { userMessage: string }).userMessage =
      'Invalid YouTube URL format. Supported: youtube.com/watch, youtu.be, youtube.com/shorts, youtube.com/live';
    throw err;
  }

  try {
    const { stdout } = await execFileAsync(
      'yt-dlp',
      ['--dump-single-json', '--no-playlist', '--skip-download', '--no-warnings', url],
      { timeout: 15000, maxBuffer: 10 * 1024 * 1024 }
    );

    const data = JSON.parse(stdout) as {
      is_live?: boolean;
      was_live?: boolean;
      live_status?: string;
      duration?: number;
      title?: string;
    };

    if (data.is_live === true || (data.was_live === false && data.live_status === 'is_live')) {
      const err = new Error('LIVE_STREAM_NOT_SUPPORTED');
      (err as unknown as { userMessage: string }).userMessage = 'Live streams are not supported until ended';
      throw err;
    }

    const duration = typeof data.duration === 'number' ? data.duration : 300;
    if (duration > 7200) {
      const err = new Error('VIDEO_TOO_LONG');
      (err as unknown as { userMessage: string }).userMessage = 'Max supported video length is 120 minutes';
      throw err;
    }

    return {
      durationSec: Math.max(10, Math.round(duration)),
      title: data.title,
      isLive: false,
    };
  } catch (err: unknown) {
    if (
      err instanceof Error &&
      ('userMessage' in err ||
        err.message === 'LIVE_STREAM_NOT_SUPPORTED' ||
        err.message === 'VIDEO_TOO_LONG' ||
        err.message === 'INVALID_YOUTUBE_URL')
    ) {
      throw err;
    }

    const isMissingBinary = (err as { code?: string })?.code === 'ENOENT';
    if (isMissingBinary) {
      console.warn('[ProjectsService] yt-dlp not found on system PATH. Proceeding with URL regex validation.');
      return { durationSec: 300, isLive: false };
    }

    const errStr = String(err);
    if (
      errStr.includes('Video unavailable') ||
      errStr.includes('Private video') ||
      errStr.includes('Sign in') ||
      errStr.includes('copyright') ||
      errStr.includes('This video is not available')
    ) {
      const unavailableErr = new Error('VIDEO_UNAVAILABLE');
      (unavailableErr as unknown as { userMessage: string }).userMessage =
        'Video is private, unavailable, or restricted';
      throw unavailableErr;
    }

    if ((err as { killed?: boolean })?.killed) {
      console.warn('[ProjectsService] yt-dlp inspection timed out after 15s. Proceeding with fallback duration.');
      return { durationSec: 300, isLive: false };
    }

    console.warn('[ProjectsService] yt-dlp inspection warning:', err);
    return { durationSec: 300, isLive: false };
  }
}

export class ProjectsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Ingests a video from a YouTube URL or S3 storage key,
   * calculates and deducts credits atomically, creates the project record,
   * and enqueues the AI clipping pipeline job.
   */
  async ingest(userId: string, input: IngestProjectInput) {
    // 0. Idempotency Check: Prevent duplicate jobs on rapid double-submit
    if (input.idempotencyKey) {
      const existingProject = await this.prisma.project.findUnique({
        where: { idempotencyKey: input.idempotencyKey },
      });
      if (existingProject) {
        return { project: existingProject, newBalance: null, deduplicated: true };
      }
    }

    // 1. Pre-Flight Video Inspection (before deducting any credits)
    let durationSec = input.estimatedDurationSec || 300;
    let videoTitle = input.title;

    if (input.youtubeUrl) {
      const preflight = await inspectYouTubeVideo(input.youtubeUrl);
      durationSec = preflight.durationSec;
      if (preflight.title && (!videoTitle || videoTitle === 'Untitled Project')) {
        videoTitle = preflight.title;
      }
    }

    const requiredCredits = Math.max(1, Math.ceil(durationSec / 60));

    // 2. Atomic Conditional Credit Deduction & Project Creation
    const { project, newBalance } = await this.prisma.$transaction(async (tx) => {
      // Ensure subscription row exists
      const existingSub = await tx.subscription.findUnique({
        where: { userId },
      });

      if (!existingSub) {
        await tx.subscription.create({
          data: {
            userId,
            planTier: 'FREE',
            status: 'active',
            billingInterval: 'monthly',
            creditBalance: 30,
          },
        });
        await tx.creditTransaction.create({
          data: {
            userId,
            amount: 30,
            reason: 'TRIAL_GRANT',
          },
        });
      }

      // Race-condition proof atomic conditional decrement:
      // Guarantees rapid parallel requests can never drive creditBalance below 0
      const updateResult = await tx.subscription.updateMany({
        where: {
          userId,
          creditBalance: { gte: requiredCredits },
        },
        data: {
          creditBalance: { decrement: requiredCredits },
        },
      });

      if (updateResult.count === 0) {
        const currentSub = await tx.subscription.findUnique({ where: { userId } });
        const err = new Error('INSUFFICIENT_CREDITS') as Error & {
          required: number;
          available: number;
        };
        err.required = requiredCredits;
        err.available = currentSub?.creditBalance ?? 0;
        throw err;
      }

      const refreshedSub = await tx.subscription.findUnique({ where: { userId } });
      const currentBalance = refreshedSub?.creditBalance ?? 0;

      const initialTimelineData = {
        version: 1,
        tracks: [
          { id: 'track-v1', type: 'VIDEO', name: 'Video 1', clips: [], locked: false, muted: false },
          { id: 'track-a1', type: 'AUDIO', name: 'Audio 1', clips: [], locked: false, muted: false },
          { id: 'track-t1', type: 'TEXT', name: 'Titles', clips: [], locked: false, muted: false },
        ],
        markers: [],
        duration: durationSec,
      };

      // Create Project with idempotencyKey & refundedAt guards
      const createdProject = await tx.project.create({
        data: {
          idempotencyKey: input.idempotencyKey || null,
          refundedAt: null,
          title: videoTitle,
          description: input.aiFocusPrompt || 'Auto-generated viral shorts',
          ownerId: userId,
          status: 'QUEUED',
          stage: 'QUEUED',
          progressPercent: 0,
          sourceUrl: input.youtubeUrl || null,
          sourceKey: input.storageKey || null,
          durationSeconds: durationSec,
          timeline: {
            create: {
              data: initialTimelineData,
              version: 1,
              versions: {
                create: {
                  version: 1,
                  description: 'Initial ingest',
                  snapshot: initialTimelineData,
                  createdBy: userId,
                },
              },
            },
          },
        },
      });

      // Log credit transaction
      await tx.creditTransaction.create({
        data: {
          userId,
          amount: -requiredCredits,
          reason: 'CLIP_GENERATION',
          projectId: createdProject.id,
        },
      });

      return { project: createdProject, newBalance: currentBalance };
    });

    // Enqueue BullMQ job
    try {
      const queue = getClipGenerationQueue();
      await queue.add('generate-clips', {
        projectId: project.id,
        userId,
        title: project.title,
        youtubeUrl: input.youtubeUrl,
        storageKey: input.storageKey,
        timeframeStart: input.timeframeStart,
        timeframeEnd: input.timeframeEnd,
        durationSeconds: durationSec,
        creditsDeducted: requiredCredits,
        preferredLength: input.preferredLength,
        captionPreset: input.captionPreset,
        aiFocusPrompt: input.aiFocusPrompt,
        contentMode: input.contentMode || 'talking_head',
        sourceType: input.sourceType || 'original',
        layoutMode: input.layoutMode || 'auto',
      });
    } catch (queueErr) {
      console.warn('[ProjectsService] Failed to enqueue to BullMQ queue, processing directly or falling back:', queueErr);
    }

    return {
      project,
      requiredCredits,
      creditBalance: newBalance,
    };
  }

  async create(userId: string, input: CreateProjectInput) {
    const initialTimelineData = {
      version: 1,
      tracks: [
        { id: 'track-v1', type: 'VIDEO', name: 'Video 1', clips: [], locked: false, muted: false },
        { id: 'track-a1', type: 'AUDIO', name: 'Audio 1', clips: [], locked: false, muted: false },
        { id: 'track-t1', type: 'TEXT', name: 'Titles', clips: [], locked: false, muted: false },
      ],
      markers: [],
      duration: 0,
    };

    const project = await this.prisma.project.create({
      data: {
        title: input.title,
        description: input.description ?? null,
        ownerId: userId,
        fps: input.fps ?? 30.0,
        width: input.width ?? 1920,
        height: input.height ?? 1080,
        status: 'QUEUED',
        stage: 'QUEUED',
        progressPercent: 0,
        timeline: {
          create: {
            data: initialTimelineData,
            version: 1,
            versions: {
              create: {
                version: 1,
                description: 'Initial project creation',
                snapshot: initialTimelineData,
                createdBy: userId,
              },
            },
          },
        },
      },
      include: {
        timeline: true,
      },
    });

    return project;
  }

  async list(userId: string) {
    return this.prisma.project.findMany({
      where: { ownerId: userId },
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: {
          select: { assets: true, generatedClips: true },
        },
      },
    });
  }

  async getById(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      include: {
        timeline: true,
        generatedClips: {
          orderBy: { viralityScore: 'desc' },
        },
        assets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return {
      ...project,
      assets: project.assets.map((a) => ({
        ...a,
        sizeBytes: a.sizeBytes.toString(),
      })),
    };
  }

  async getClips(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return this.prisma.generatedClip.findMany({
      where: { projectId },
      orderBy: { viralityScore: 'desc' },
    });
  }

  async updateClip(
    userId: string,
    clipId: string,
    input: {
      title?: string;
      layoutMode?: string;
      timelineAstJson?: object;
    }
  ) {
    const clip = await this.prisma.generatedClip.findFirst({
      where: {
        id: clipId,
        project: { ownerId: userId },
      },
    });

    if (!clip) {
      throw new Error('CLIP_NOT_FOUND');
    }

    return this.prisma.generatedClip.update({
      where: { id: clipId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.layoutMode && { layoutMode: input.layoutMode }),
        ...(input.timelineAstJson && { timelineAstJson: input.timelineAstJson }),
      },
    });
  }

  async exportClip(userId: string, clipId: string, input: ClipExportInput) {
    const clip = await this.prisma.generatedClip.findFirst({
      where: {
        id: clipId,
        project: { ownerId: userId },
      },
    });

    if (!clip) {
      throw new Error('CLIP_NOT_FOUND');
    }

    const sub = await this.prisma.subscription.findUnique({
      where: { userId },
    });

    const isFree = !sub || sub.planTier === 'FREE';
    const includeWatermark = input.includeWatermark !== undefined ? input.includeWatermark : isFree;

    const queue = getClipExportQueue();
    const job = await queue.add('export-clip', {
      clipId: clip.id,
      projectId: clip.projectId,
      userId,
      format: input.format,
      includeWatermark,
    });

    return {
      jobId: job.id,
      clipId: clip.id,
      format: input.format,
      includeWatermark,
      status: 'QUEUED',
    };
  }

  async update(userId: string, projectId: string, input: UpdateProjectInput) {
    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(input.title && { title: input.title }),
        ...(input.description !== undefined && { description: input.description }),
        ...(input.fps && { fps: input.fps }),
        ...(input.width && { width: input.width }),
        ...(input.height && { height: input.height }),
      },
    });
  }

  async delete(userId: string, projectId: string) {
    const existing = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });

    if (!existing) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return this.prisma.project.delete({
      where: { id: projectId },
    });
  }
}
