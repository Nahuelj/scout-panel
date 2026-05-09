import { type NextRequest, NextResponse } from 'next/server';
import { BETTER_AUTH_SESSION_COOKIE } from '@/lib/better-auth-session-cookie';

const protectedRoutes = ['/players'];
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(BETTER_AUTH_SESSION_COOKIE);
  const isAuthenticated = Boolean(sessionCookie?.value);

  if (pathname === '/') {
    const destination = isAuthenticated ? '/players' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!isAuthenticated) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (authRoutes.some((route) => pathname.startsWith(route))) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/players', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/players/:path*', '/login', '/register'],
};
