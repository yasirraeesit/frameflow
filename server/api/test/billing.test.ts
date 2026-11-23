import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';

describe('Commercial Managed Credits & Paddle Billing API', () => {
  const app = buildServer();
  let testUserToken = '';
  let testUserId = '';
  const testEmail = `billingtest-${Date.now()}@example.com`;

  before(async () => {
    await app.ready();

    // Register a test user
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email: testEmail,
        password: 'password123',
        name: 'Billing Tester',
      },
    });

    assert.strictEqual(regRes.statusCode, 201);
    const regBody = JSON.parse(regRes.payload);
    testUserToken = regBody.token;
    testUserId = regBody.user.id;
  });

  after(async () => {
    try {
      await prisma.user.deleteMany({
        where: { email: { contains: 'billingtest' } },
      });
    } catch {
      // ignore
    }
    await app.close();
  });

  it('GET /api/billing/status returns initialized 30 trial credits and entitlements', async () => {
    const res = await app.inject({
      method: 'GET',
      url: '/api/billing/status',
      headers: {
        authorization: `Bearer ${testUserToken}`,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.billing.planTier, 'FREE');
    assert.strictEqual(body.billing.creditBalance, 30);
    assert.strictEqual(body.billing.monthlyQuota, 30);
    assert.strictEqual(body.billing.status, 'active');
    assert.strictEqual(body.billing.entitlements.removeWatermark, false);
    assert.strictEqual(body.billing.entitlements.maxBrandTemplates, 1);
    assert.ok(Array.isArray(body.transactions));
    assert.strictEqual(body.transactions[0].reason, 'TRIAL_GRANT');
    assert.strictEqual(body.transactions[0].amount, 30);
  });

  it('POST /api/billing/deduct decrements credits atomically for video processing', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/billing/deduct',
      headers: {
        authorization: `Bearer ${testUserToken}`,
      },
      payload: {
        projectId: 'project-test-1',
        requiredCredits: 10,
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.creditBalance, 20); // 30 - 10
    assert.ok(body.transactionId);
  });

  it('POST /api/billing/deduct returns 402 INSUFFICIENT_CREDITS when exceeding balance', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/billing/deduct',
      headers: {
        authorization: `Bearer ${testUserToken}`,
      },
      payload: {
        projectId: 'project-test-2',
        requiredCredits: 50, // exceeds remaining 20
      },
    });

    assert.strictEqual(res.statusCode, 402);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.error, 'INSUFFICIENT_CREDITS');
  });

  it('POST /api/billing/refund restores credits when an AI job fails', async () => {
    const res = await app.inject({
      method: 'POST',
      url: '/api/billing/refund',
      headers: {
        authorization: `Bearer ${testUserToken}`,
      },
      payload: {
        projectId: 'project-test-1',
        credits: 10,
        reason: 'Worker transcoding timeout',
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.success, true);
    assert.strictEqual(body.creditBalance, 30); // 20 + 10 restored
  });

  it('POST /api/webhooks/paddle processes subscription upgrade and grants credits', async () => {
    const webhookPayload = {
      event_id: 'evt_test_123',
      event_type: 'subscription.created',
      data: {
        id: 'sub_paddle_test_456',
        customer_id: 'ctm_paddle_test_789',
        custom_data: {
          userId: testUserId,
        },
        items: [
          {
            price: {
              id: 'pri_pro_monthly_tier',
              billing_cycle: {
                interval: 'month',
                frequency: 1,
              },
            },
            quantity: 1,
          },
        ],
        current_billing_period: {
          ends_at: new Date(Date.now() + 30 * 86400000).toISOString(),
        },
      },
    };

    const res = await app.inject({
      method: 'POST',
      url: '/api/webhooks/paddle',
      payload: webhookPayload,
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.strictEqual(body.received, true);

    // Verify user's upgraded billing status
    const statusRes = await app.inject({
      method: 'GET',
      url: '/api/billing/status',
      headers: {
        authorization: `Bearer ${testUserToken}`,
      },
    });

    const statusBody = JSON.parse(statusRes.payload);
    assert.strictEqual(statusBody.billing.planTier, 'PRO');
    assert.strictEqual(statusBody.billing.creditBalance, 330); // 30 + 300
    assert.strictEqual(statusBody.billing.entitlements.removeWatermark, true);
    assert.strictEqual(statusBody.billing.entitlements.xmlExport, true);
    assert.strictEqual(statusBody.billing.entitlements.maxBrandTemplates, 4);
  });
});
