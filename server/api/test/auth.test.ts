import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { buildServer } from '../src/server.js';
import { prisma } from '@frameflow/database';

describe('Auth API Endpoints', () => {
  const app = buildServer();

  before(async () => {
    await app.ready();
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'authtest' } },
    });
    await app.close();
  });

  it('registers a new user successfully', async () => {
    const email = `authtest-${Date.now()}@example.com`;
    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
        name: 'Auth Test User',
      },
    });

    assert.strictEqual(res.statusCode, 201);
    const body = JSON.parse(res.payload);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, email);
    assert.strictEqual(body.user.name, 'Auth Test User');
  });

  it('rejects registration with duplicate email', async () => {
    const email = `authtest-dup-${Date.now()}@example.com`;
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });

    assert.strictEqual(res.statusCode, 409);
  });

  it('logs in an existing user and returns JWT', async () => {
    const email = `authtest-login-${Date.now()}@example.com`;
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email,
        password: 'password123',
      },
    });

    assert.strictEqual(res.statusCode, 200);
    const body = JSON.parse(res.payload);
    assert.ok(body.token);
    assert.strictEqual(body.user.email, email);
  });

  it('rejects login with wrong password', async () => {
    const email = `authtest-badpwd-${Date.now()}@example.com`;
    await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });

    const res = await app.inject({
      method: 'POST',
      url: '/api/auth/login',
      payload: {
        email,
        password: 'wrongpassword',
      },
    });

    assert.strictEqual(res.statusCode, 401);
  });

  it('authenticates /api/auth/me using JWT token', async () => {
    const email = `authtest-me-${Date.now()}@example.com`;
    const regRes = await app.inject({
      method: 'POST',
      url: '/api/auth/register',
      payload: {
        email,
        password: 'password123',
      },
    });
    const { token } = JSON.parse(regRes.payload);

    const meRes = await app.inject({
      method: 'GET',
      url: '/api/auth/me',
      headers: {
        authorization: `Bearer ${token}`,
      },
    });

    assert.strictEqual(meRes.statusCode, 200);
    const body = JSON.parse(meRes.payload);
    assert.strictEqual(body.user.email, email);
  });
});

