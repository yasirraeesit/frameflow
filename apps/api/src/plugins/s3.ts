import fp from 'fastify-plugin';
import { FastifyPluginAsync } from 'fastify';
import {
  S3Client,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';

declare module 'fastify' {
  interface FastifyInstance {
    s3: S3Client;
  }
}

export const S3_BUCKETS = {
  RAW: process.env.S3_BUCKET_RAW || 'raw-assets',
  PROXIES: process.env.S3_BUCKET_PROXIES || 'proxies',
  THUMBNAILS: process.env.S3_BUCKET_THUMBNAILS || 'thumbnails',
  RENDERS: process.env.S3_BUCKET_RENDERS || 'renders',
};

export const createS3Client = (): S3Client => {
  return new S3Client({
    endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
    region: process.env.S3_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadminpassword',
    },
    forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
  });
};

const s3Plugin: FastifyPluginAsync = fp(async (server) => {
  const s3 = createS3Client();
  server.decorate('s3', s3);

  // Automatically ensure buckets exist
  const buckets = Object.values(S3_BUCKETS);
  for (const bucket of buckets) {
    try {
      await s3.send(new HeadBucketCommand({ Bucket: bucket }));
    } catch {
      try {
        await s3.send(new CreateBucketCommand({ Bucket: bucket }));
        server.log.info(`Provisioned S3 bucket: ${bucket}`);
      } catch (err) {
        server.log.warn({ err }, `Could not create bucket ${bucket}`);
      }
    }
  }

  server.addHook('onClose', () => {
    s3.destroy();
  });
});

export default s3Plugin;
