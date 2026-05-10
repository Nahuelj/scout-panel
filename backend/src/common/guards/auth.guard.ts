import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';
import type { AuthedSessionUser } from '../request-auth.types';

type RequestWithAuth = Request & { authUser?: AuthedSessionUser };

@Injectable()
export class AuthGuard implements CanActivate {
  private readonly logger = new Logger(AuthGuard.name);

  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<RequestWithAuth>();

    let session: Awaited<
      ReturnType<typeof this.authService.auth.api.getSession>
    > = null;
    try {
      session = await this.authService.auth.api.getSession({
        headers: fromNodeHeaders(request.headers),
      });
    } catch (error) {
      this.logger.warn(
        `Session lookup failed: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
      throw new UnauthorizedException();
    }

    if (!session?.user) throw new UnauthorizedException();

    request.authUser = session.user;
    return true;
  }
}
