import type { CookieOptions, Response } from 'express';

export const AUTH_COOKIE_NAME = 'auth_token';

const DURATION_REGEX = /^(\d+)([smhd])$/;
const SECOND_MS = 1_000;
const MINUTE_MS = 60_000;
const HOUR_MS = 3_600_000;
const DAY_MS = 86_400_000;
const DEFAULT_DURATION_MS = 7 * DAY_MS;

export function durationToMs(value: string): number {
  const match = DURATION_REGEX.exec(value.trim());
  if (!match) return DEFAULT_DURATION_MS;
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case 's':
      return amount * SECOND_MS;
    case 'm':
      return amount * MINUTE_MS;
    case 'h':
      return amount * HOUR_MS;
    case 'd':
      return amount * DAY_MS;
    default:
      return DEFAULT_DURATION_MS;
  }
}

export function buildAuthCookieOptions(maxAgeMs: number): CookieOptions {
  const isProd = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    path: '/',
    maxAge: maxAgeMs,
  };
}

export function setAuthCookie(
  res: Response,
  token: string,
  maxAgeMs: number,
): void {
  res.cookie(AUTH_COOKIE_NAME, token, buildAuthCookieOptions(maxAgeMs));
}

export function clearAuthCookie(res: Response): void {
  res.clearCookie(AUTH_COOKIE_NAME, {
    ...buildAuthCookieOptions(0),
    maxAge: undefined,
  });
}
