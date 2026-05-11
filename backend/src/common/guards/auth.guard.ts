import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import { AUTH_COOKIE_NAME } from '../../auth/auth.cookie';
import { AuthService } from '../../auth/auth.service';
import type { AuthedSessionUser } from '../request-auth.types';

type RequestWithAuth = Request & {
  authUser?: AuthedSessionUser;
  cookies?: Record<string, string | undefined>;
};

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const token = extractToken(request);
    if (!token) throw new UnauthorizedException();

    const userId = this.authService.verifyToken(token);
    const user = await this.authService.findUserById(userId);
    if (!user) throw new UnauthorizedException();

    request.authUser = user;
    return true;
  }
}

function extractToken(request: RequestWithAuth): string | null {
  const header = request.headers.authorization;
  if (header && typeof header === 'string') {
    const [scheme, value] = header.split(' ');
    if (scheme?.toLowerCase() === 'bearer' && value) {
      return value.trim();
    }
  }

  const cookieToken = request.cookies?.[AUTH_COOKIE_NAME];
  if (typeof cookieToken === 'string' && cookieToken.length > 0) {
    return cookieToken;
  }

  return null;
}
