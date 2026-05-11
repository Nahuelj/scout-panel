import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Response } from 'express';
import { ErrorResponseDto } from '../common/dto/error-response.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthGuard } from '../common/guards/auth.guard';
import type { AuthedSessionUser } from '../common/request-auth.types';
import type { Env } from '../config/env.schema';
import { AuthService } from './auth.service';
import { clearAuthCookie, durationToMs, setAuthCookie } from './auth.cookie';
import { AuthResponseDto, AuthUserDto } from './dto/auth-user.dto';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  private readonly cookieMaxAgeMs: number;

  constructor(
    private readonly authService: AuthService,
    config: ConfigService<Env, true>,
  ) {
    this.cookieMaxAgeMs = durationToMs(
      config.get('JWT_EXPIRES_IN', { infer: true }),
    );
  }

  @Post('register')
  @ApiOperation({ summary: 'Create a new user and start a session' })
  @ApiCreatedResponse({ type: AuthResponseDto })
  @ApiConflictResponse({
    type: ErrorResponseDto,
    description: 'Email already registered',
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async register(
    @Body() body: RegisterDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { token, user } = await this.authService.register(body);
    setAuthCookie(res, token, this.cookieMaxAgeMs);
    return { user };
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: 'Authenticate with email and password' })
  @ApiOkResponse({ type: AuthResponseDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Invalid credentials',
  })
  @ApiBadRequestResponse({ type: ErrorResponseDto })
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthResponseDto> {
    const { token, user } = await this.authService.login(body);
    setAuthCookie(res, token, this.cookieMaxAgeMs);
    return { user };
  }

  @Post('logout')
  @HttpCode(204)
  @ApiOperation({ summary: 'Clear the current session cookie' })
  @ApiNoContentResponse()
  logout(@Res({ passthrough: true }) res: Response): void {
    clearAuthCookie(res);
  }

  @Get('me')
  @UseGuards(AuthGuard)
  @ApiBearerAuth('bearer')
  @ApiOperation({ summary: 'Return the authenticated user' })
  @ApiOkResponse({ type: AuthUserDto })
  @ApiUnauthorizedResponse({
    type: ErrorResponseDto,
    description: 'Missing or invalid token',
  })
  me(@CurrentUser() user: AuthedSessionUser): AuthUserDto {
    return user;
  }
}
