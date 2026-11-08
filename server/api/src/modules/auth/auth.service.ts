import bcrypt from 'bcryptjs';
import { PrismaClient } from '@frameflow/database';
import { RegisterInput, LoginInput } from '@frameflow/shared';

export class AuthService {
  constructor(private prisma: PrismaClient) {}

  async register(input: RegisterInput) {
    const existing = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new Error('EMAIL_EXISTS');
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(input.password, salt);

    const user = await this.prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        name: input.name ?? null,
      },
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      storageQuotaBytes: user.storageQuotaBytes.toString(),
      usedStorageBytes: user.usedStorageBytes.toString(),
    };
  }

  async login(input: LoginInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new Error('INVALID_CREDENTIALS');
    }

    const valid = await bcrypt.compare(input.password, user.passwordHash);
    if (!valid) {
      throw new Error('INVALID_CREDENTIALS');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      storageQuotaBytes: user.storageQuotaBytes.toString(),
      usedStorageBytes: user.usedStorageBytes.toString(),
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new Error('USER_NOT_FOUND');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      storageQuotaBytes: user.storageQuotaBytes.toString(),
      usedStorageBytes: user.usedStorageBytes.toString(),
    };
  }
}

