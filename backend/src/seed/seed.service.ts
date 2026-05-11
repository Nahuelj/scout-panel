import {
  Injectable,
  Logger,
  type OnApplicationBootstrap,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { runSeed } from '../../prisma/seed/seed';
import type { Env } from '../config/env.schema';

@Injectable()
export class SeedService implements OnApplicationBootstrap {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
    private readonly authService: AuthService,
  ) {}

  async onApplicationBootstrap(): Promise<void> {
    const explicit = this.config.get('SEED_ON_BOOT', { infer: true });
    // Default behaviour: always seed on boot. Set SEED_ON_BOOT=false to skip.
    const enabled = explicit ?? true;
    if (!enabled) {
      return;
    }

    await this.seedFixtures();
    await this.seedDefaultUser();
  }

  private async seedFixtures(): Promise<void> {
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

  private async seedDefaultUser(): Promise<void> {
    const email = this.config.get('DEFAULT_USER_EMAIL', { infer: true });
    const password = this.config.get('DEFAULT_USER_PASSWORD', { infer: true });
    const name = this.config.get('DEFAULT_USER_NAME', { infer: true });

    try {
      const existing = await this.prisma.user.findUnique({
        where: { email },
        select: { id: true },
      });
      if (existing) {
        this.logger.log(`Default user already present (${email}).`);
        return;
      }

      await this.authService.register({ email, password, name });
      this.logger.log(`Default user created (${email}).`);
    } catch (error) {
      this.logger.error('Failed to create default user', error as Error);
    }
  }
}
