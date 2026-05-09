import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import type { AuthedSessionUser } from '../request-auth.types';

type RequestWithAuth = Request & { authUser?: AuthedSessionUser };

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();
    const session = await this.authService.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session?.user) throw new UnauthorizedException();

    request.authUser = session.user as AuthedSessionUser;
    return true;
  }
}
