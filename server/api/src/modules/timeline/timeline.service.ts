import { PrismaClient, Prisma } from '@frameflow/database';

export class TimelineService {
  constructor(private prisma: PrismaClient) {}

  private async verifyProjectAccess(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');
    return project;
  }

  async getTimeline(userId: string, projectId: string) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });

    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');
    return timeline;
  }

  async updateTimeline(userId: string, projectId: string, data: Prisma.InputJsonValue) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });
    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');

    const nextVersion = timeline.version + 1;

    const updated = await this.prisma.timeline.update({
      where: { projectId },
      data: {
        data,
        version: nextVersion,
      },
    });

    return updated;
  }

  async createVersion(userId: string, projectId: string, description: string) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });
    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');

    const versionRecord = await this.prisma.timelineVersion.create({
      data: {
        timelineId: timeline.id,
        version: timeline.version,
        description,
        snapshot: timeline.data as Prisma.InputJsonValue,
        createdBy: userId,
      },
    });

    return versionRecord;
  }

  async listVersions(userId: string, projectId: string) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });
    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');

    return this.prisma.timelineVersion.findMany({
      where: { timelineId: timeline.id },
      orderBy: { version: 'desc' },
    });
  }

  async restoreVersion(userId: string, projectId: string, targetVersion: number) {
    await this.verifyProjectAccess(userId, projectId);

    const timeline = await this.prisma.timeline.findUnique({
      where: { projectId },
    });
    if (!timeline) throw new Error('TIMELINE_NOT_FOUND');

    const snapshotRecord = await this.prisma.timelineVersion.findUnique({
      where: {
        timelineId_version: {
          timelineId: timeline.id,
          version: targetVersion,
        },
      },
    });

    if (!snapshotRecord) throw new Error('VERSION_NOT_FOUND');

    const nextVersion = timeline.version + 1;

    // Update current timeline with snapshot data and record restoration version
    const [updatedTimeline] = await this.prisma.$transaction([
      this.prisma.timeline.update({
        where: { projectId },
        data: {
          data: snapshotRecord.snapshot as Prisma.InputJsonValue,
          version: nextVersion,
        },
      }),
      this.prisma.timelineVersion.create({
        data: {
          timelineId: timeline.id,
          version: nextVersion,
          description: `Restored from version ${targetVersion} ("${snapshotRecord.description}")`,
          snapshot: snapshotRecord.snapshot as Prisma.InputJsonValue,
          createdBy: userId,
        },
      }),
    ]);

    return updatedTimeline;
  }
}

