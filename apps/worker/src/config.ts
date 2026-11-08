import { S3Client } from '@aws-sdk/client-s3';
import { Redis } from 'ioredis';

export const CONFIG = {
  REDIS_URL: process.env.REDIS_URL || 'redis://localhost:6379',
  S3_ENDPOINT: process.env.S3_ENDPOINT || 'http://localhost:9000',
  S3_REGION: process.env.S3_REGION || 'us-east-1',
  S3_ACCESS_KEY: process.env.S3_ACCESS_KEY || 'minioadmin',
  S3_SECRET_KEY: process.env.S3_SECRET_KEY || 'minioadminpassword',
  S3_FORCE_PATH_STYLE: process.env.S3_FORCE_PATH_STYLE === 'true',
  S3_BUCKETS: {
    RAW: process.env.S3_BUCKET_RAW || 'raw-assets',
    PROXIES: process.env.S3_BUCKET_PROXIES || 'proxies',
    THUMBNAILS: process.env.S3_BUCKET_THUMBNAILS || 'thumbnails',
    RENDERS: process.env.S3_BUCKET_RENDERS || 'renders',
  },
};

export function createWorkerS3Client(): S3Client {
  return new S3Client({
    endpoint: CONFIG.S3_ENDPOINT,
    region: CONFIG.S3_REGION,
    credentials: {
      accessKeyId: CONFIG.S3_ACCESS_KEY,
      secretAccessKey: CONFIG.S3_SECRET_KEY,
    },
    forcePathStyle: CONFIG.S3_FORCE_PATH_STYLE,
  });
}

export function createRedisClient(): Redis {
  return new Redis(CONFIG.REDIS_URL, { maxRetriesPerRequest: null });
}

