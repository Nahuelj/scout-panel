import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { Env } from '../config/env.schema';
import { PrismaService } from '../prisma/prisma.service';
import type { AuthedSessionUser } from '../common/request-auth.types';

const BCRYPT_ROUNDS = 10;

type RegisterInput = {
  email: string;
  name: string;
  password: string;
};

type LoginInput = {
  email: string;
  password: string;
};

export type AuthResult = {
  token: string;
  user: AuthedSessionUser;
};

type JwtPayload = {
  sub: string;
};

@Injectable()
export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService<Env, true>,
  ) {
    this.jwtSecret = this.config.get('JWT_SECRET', { infer: true });
    this.jwtExpiresIn = this.config.get('JWT_EXPIRES_IN', { infer: true });
  }

  async register(input: RegisterInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();
    const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);

    try {
      const user = await this.prisma.user.create({
        data: {
          email,
          name: input.name.trim(),
          passwordHash,
        },
        select: { id: true, email: true, name: true },
      });
      return this.buildAuthResult(user);
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException('Email already registered');
      }
      throw error;
    }
  }

  async login(input: LoginInput): Promise<AuthResult> {
    const email = input.email.toLowerCase().trim();
    const user = await this.prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, name: true, passwordHash: true },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(input.password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.buildAuthResult({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  }

  verifyToken(token: string): AuthedSessionUser['id'] {
    try {
      const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;
      if (!payload?.sub || typeof payload.sub !== 'string') {
        throw new UnauthorizedException();
      }
      return payload.sub;
    } catch {
      throw new UnauthorizedException();
    }
  }

  async findUserById(id: string): Promise<AuthedSessionUser | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, name: true },
    });
    return user;
  }

  private buildAuthResult(user: AuthedSessionUser): AuthResult {
    const token = jwt.sign({ sub: user.id }, this.jwtSecret, {
      expiresIn: this.jwtExpiresIn as jwt.SignOptions['expiresIn'],
    });
    return { token, user };
  }
}
