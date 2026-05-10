import { All, Controller, Req, Res } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { toNodeHandler } from 'better-auth/node';
import type { Request, Response } from 'express';
import { AuthService } from './auth.service';

@ApiExcludeController()
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @All('/api/auth/*path')
  handler(@Req() req: Request, @Res() res: Response) {
    return toNodeHandler(this.authService.auth)(req, res);
  }
}
