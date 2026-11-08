import { describe, it } from 'node:test';
import assert from 'node:assert';
import { RegisterInputSchema, LoginInputSchema } from './auth.schema.js';
import { CreateProjectInputSchema } from './project.schema.js';
import { CreateRenderInputSchema, RenderJobResponseSchema } from './render.schema.js';
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

  it('validates render creation input and render job response', () => {
    const defaultInput = CreateRenderInputSchema.parse({});
    assert.strictEqual(defaultInput.preset, '1080p_h264');

    const customInput = CreateRenderInputSchema.parse({ preset: '720p_h264' });
    assert.strictEqual(customInput.preset, '720p_h264');

    const validJob = RenderJobResponseSchema.safeParse({
      id: '550e8400-e29b-41d4-a716-446655440000',
      projectId: '550e8400-e29b-41d4-a716-446655440001',
      preset: '1080p_h264',
      status: 'RENDERING',
      progress: 65,
      outputS3Key: null,
      errorMessage: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    });
    assert.strictEqual(validJob.success, true);
  });
});
