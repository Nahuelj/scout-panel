import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import { runSeed } from '../../prisma/seed/seed';
import type { Env } from '../config/env.schema';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const enabled = this.config.get('SEED_ON_BOOT', { infer: true });
    if (!enabled) {
      return;
    }

    try {
      const result = await runSeed(this.prisma);
      if (result.created === 0) {
        this.logger.log(
          `Seed up-to-date (${result.alreadyPresent}/${result.totalFixtures} players already present).`,
        );
        return;
      }
      this.logger.log(
        `Seed applied (${result.created} new, ${result.alreadyPresent} already present, ${result.totalFixtures} total).`,
      );
    } catch (error) {
      this.logger.error('Failed to run seed on boot', error as Error);
    }
  }
}
