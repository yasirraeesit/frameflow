import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RegisterInputSchema, LoginInputSchema } from './auth.schema.js';
import { CreateProjectInputSchema } from './project.schema.js';
import { AssetStatusEnum, JobProgressEventSchema } from '../events/job.events.js';

describe('Shared Schemas & Validation', () => {
  it('validates registration input correctly', () => {
    const valid = RegisterInputSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
      name: 'John Doe',
    });
    assert.strictEqual(valid.success, true);

    const invalidEmail = RegisterInputSchema.safeParse({
      email: 'invalid-email',
      password: '123',
    });
    assert.strictEqual(invalidEmail.success, false);
  });

  it('validates login input correctly', () => {
    const valid = LoginInputSchema.safeParse({
      email: 'test@example.com',
      password: 'secretpassword',
    });
    assert.strictEqual(valid.success, true);

    const invalid = LoginInputSchema.safeParse({
      email: 'not-an-email',
      password: '',
    });
    assert.strictEqual(invalid.success, false);
  });

  it('validates project creation input', () => {
    const valid = CreateProjectInputSchema.safeParse({
      title: 'My Video Project',
      fps: 30,
    });
    assert.strictEqual(valid.success, true);

    const invalidFps = CreateProjectInputSchema.safeParse({
      title: 'Invalid',
      fps: -5,
    });
    assert.strictEqual(invalidFps.success, false);
  });

  it('validates asset status and job progress event payloads', () => {
    assert.strictEqual(AssetStatusEnum.enum.READY, 'READY');

    const validEvent = JobProgressEventSchema.safeParse({
      jobId: 'job-123',
      projectId: 'proj-456',
      assetId: 'asset-789',
      type: 'METADATA_EXTRACTION',
      status: 'PROCESSING',
      progress: 45,
      message: 'Extracting audio streams',
    });
    assert.strictEqual(validEvent.success, true);
  });
});
