import { describe, it, before, after } from 'node:test';
import assert from 'node:assert';
import { prisma } from './index.js';

describe('Database & Prisma Client Tests', () => {
  before(async () => {
    await prisma.$connect();
  });

  after(async () => {
    await prisma.user.deleteMany({
      where: { email: { contains: 'test-db-user' } },
    });
    await prisma.$disconnect();
  });

  it('can create and retrieve a test user with a project', async () => {
    const email = `test-db-user-${Date.now()}@example.com`;
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash: 'testhash123',
        name: 'Test DB User',
        projects: {
          create: {
            title: 'Test Project',
            fps: 30,
            width: 1920,
            height: 1080,
          },
        },
      },
      include: {
        projects: true,
      },
    });

    assert.strictEqual(user.email, email);
    assert.strictEqual(user.projects.length, 1);
    assert.strictEqual(user.projects[0]?.title, 'Test Project');

    const found = await prisma.user.findUnique({
      where: { id: user.id },
    });
    assert.ok(found);
    assert.strictEqual(found.email, email);
  });
});

