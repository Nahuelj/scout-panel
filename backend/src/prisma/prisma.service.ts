import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import type { Env } from '../config/env.schema';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  constructor(configService: ConfigService<Env, true>) {
    const adapter = new PrismaPg(configService.get('DATABASE_URL', { infer: true }));
    super({ adapter });
  }

  async onModuleInit() {
    await this.$connect();
  }
}
