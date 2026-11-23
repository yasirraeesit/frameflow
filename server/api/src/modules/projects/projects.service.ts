import { PrismaClient } from '@frameflow/database';
import {
  CreateProjectInput,
  UpdateProjectInput,
  IngestProjectInput,
  ClipExportInput,
} from '@frameflow/shared';
import { getClipGenerationQueue } from '../../queues/clip-generation.queue.js';
import { getClipExportQueue } from '../../queues/clip-export.queue.js';

export class ProjectsService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Ingests a video from a YouTube URL or S3 storage key,
   * calculates and deducts credits atomically, creates the project record,
   * and enqueues the AI clipping pipeline job.
   */
  async ingest(userId: string, input: IngestProjectInput) {
    const durationSec = input.estimatedDurationSec || 300;
    const requiredCredits = Math.max(1, Math.ceil(durationSec / 60));

    // Verify credits atomically
    const { project, newBalance } = await this.prisma.$transaction(async (tx) => {
      let sub = await tx.subscription.findUnique({
        where: { userId },
      });

      if (!sub) {
        sub = await tx.subscription.create({
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

      if (sub.creditBalance < requiredCredits) {
        const err = new Error('INSUFFICIENT_CREDITS') as Error & {
          required: number;
          available: number;
        };
        err.required = requiredCredits;
        err.available = sub.creditBalance;
        throw err;
      }

      // Deduct credits
      const updatedSub = await tx.subscription.update({
        where: { userId },
        data: {
          creditBalance: { decrement: requiredCredits },
        },
      });

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

      // Create Project
      const createdProject = await tx.project.create({
        data: {
          title: input.title,
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

      return { project: createdProject, newBalance: updatedSub.creditBalance };
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
