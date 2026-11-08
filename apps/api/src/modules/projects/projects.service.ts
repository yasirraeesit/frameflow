import { PrismaClient } from '@frameflow/database';
import { CreateProjectInput, UpdateProjectInput } from '@frameflow/shared';

export class ProjectsService {
  constructor(private prisma: PrismaClient) {}

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
          select: { assets: true },
        },
      },
    });
  }

  async getById(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
      include: {
        timeline: true,
        assets: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    return project;
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
