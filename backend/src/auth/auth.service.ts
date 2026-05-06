import { Injectable, OnModuleInit } from '@nestjs/common';
import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { getFrontendOrigins } from '../frontend-origins';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService implements OnModuleInit {
  public auth!: ReturnType<typeof betterAuth>;

  constructor(private readonly prisma: PrismaService) {}

  onModuleInit() {
    this.auth = betterAuth({
      database: prismaAdapter(this.prisma, {
        provider: 'postgresql',
      }),
      emailAndPassword: {
        enabled: true,
      },
      secret: process.env.BETTER_AUTH_SECRET,
      baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:8080',
      trustedOrigins: getFrontendOrigins(),
    }) as ReturnType<typeof betterAuth>;
  }
}
