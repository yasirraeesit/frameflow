import { S3Client, CreateMultipartUploadCommand, UploadPartCommand, CompleteMultipartUploadCommand, AbortMultipartUploadCommand } from '@aws-sdk/client-s3';
import { PrismaClient } from '@frameflow/database';
import { S3_BUCKETS } from '../../plugins/s3.js';
import { getMediaQueue } from '../../queues/media.queue.js';
import { InitUploadInput, CompleteUploadInput } from '@frameflow/shared';
import crypto from 'node:crypto';

export class AssetsService {
  constructor(
    private prisma: PrismaClient,
    private s3: S3Client
  ) {}

  async initUpload(userId: string, projectId: string, input: InitUploadInput) {
    // Verify user owns project
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) {
      throw new Error('PROJECT_NOT_FOUND');
    }

    // Verify storage quota
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user) throw new Error('USER_NOT_FOUND');

    if (user.usedStorageBytes + BigInt(input.sizeBytes) > user.storageQuotaBytes) {
      throw new Error('STORAGE_QUOTA_EXCEEDED');
    }

    const ext = input.filename.split('.').pop() || 'mp4';
    const s3Key = `${projectId}/${crypto.randomUUID()}.${ext}`;

    const command = new CreateMultipartUploadCommand({
      Bucket: S3_BUCKETS.RAW,
      Key: s3Key,
      ContentType: input.mimeType,
    });

    const res = await this.s3.send(command);

    return {
      uploadId: res.UploadId as string,
      key: s3Key,
      partSize: 5 * 1024 * 1024, // 5MB default chunk
    };
  }

  async uploadPart(
    userId: string,
    projectId: string,
    uploadId: string,
    key: string,
    partNumber: number,
    data: Buffer
  ) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');

    const command = new UploadPartCommand({
      Bucket: S3_BUCKETS.RAW,
      Key: key,
      UploadId: uploadId,
      PartNumber: partNumber,
      Body: data,
    });

    const res = await this.s3.send(command);
    // ETag is returned with quotes e.g. '"hash"', return cleaned or raw
    const etag = res.ETag?.replace(/"/g, '') || '';
    return { etag };
  }

  async completeUpload(userId: string, projectId: string, input: CompleteUploadInput) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');

    try {
      const command = new CompleteMultipartUploadCommand({
        Bucket: S3_BUCKETS.RAW,
        Key: input.key,
        UploadId: input.uploadId,
        MultipartUpload: {
          Parts: input.parts.map((p) => ({
            PartNumber: p.partNumber,
            ETag: `"${p.etag.replace(/"/g, '')}"`,
          })),
        },
      });

      await this.s3.send(command);

      // Create Asset in DB
      const asset = await this.prisma.asset.create({
        data: {
          projectId,
          originalName: input.filename,
          s3Key: input.key,
          mimeType: input.mimeType,
          sizeBytes: BigInt(input.sizeBytes),
          status: 'QUEUED',
        },
      });

      // Update user storage used
      await this.prisma.user.update({
        where: { id: userId },
        data: {
          usedStorageBytes: {
            increment: BigInt(input.sizeBytes),
          },
        },
      });

      // Enqueue job in BullMQ
      const queue = getMediaQueue();
      await queue.add('process-media', {
        assetId: asset.id,
        projectId,
        s3Key: input.key,
        s3Bucket: S3_BUCKETS.RAW,
        originalName: input.filename,
        mimeType: input.mimeType,
      });

      return {
        ...asset,
        sizeBytes: asset.sizeBytes.toString(),
      };
    } catch (err) {
      // Abort upload on failure
      try {
        await this.s3.send(
          new AbortMultipartUploadCommand({
            Bucket: S3_BUCKETS.RAW,
            Key: input.key,
            UploadId: input.uploadId,
          })
        );
      } catch {
        // ignore abort error
      }
      throw err;
    }
  }

  async list(userId: string, projectId: string) {
    const project = await this.prisma.project.findFirst({
      where: { id: projectId, ownerId: userId },
    });
    if (!project) throw new Error('PROJECT_NOT_FOUND');

    const assets = await this.prisma.asset.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return assets.map((a) => ({
      ...a,
      sizeBytes: a.sizeBytes.toString(),
    }));
  }
}
