import { createParamDecorator, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import type { AuthedSessionUser } from '../request-auth.types';

type RequestWithAuth = Request & { authUser?: AuthedSessionUser };

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): AuthedSessionUser => {
    const req = ctx.switchToHttp().getRequest<RequestWithAuth>();
    const user = req.authUser;
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  },
);
