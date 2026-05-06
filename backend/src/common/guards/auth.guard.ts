import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { fromNodeHeaders } from 'better-auth/node';
import { Request } from 'express';
import { AuthService } from '../../auth/auth.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly authService: AuthService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const session = await this.authService.auth.api.getSession({
      headers: fromNodeHeaders(request.headers),
    });

    if (!session) throw new UnauthorizedException();

    return true;
  }
}
