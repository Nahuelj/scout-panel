import { type NextRequest, NextResponse } from 'next/server';
import { BETTER_AUTH_SESSION_COOKIE } from '@/features/auth/lib/session-cookie';

const authRoutes = ['/login', '/register'];

function isAuthRoute(pathname: string): boolean {
  return authRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(BETTER_AUTH_SESSION_COOKIE);
  const isAuthenticated = Boolean(sessionCookie?.value);

  if (pathname === '/') {
    const destination = isAuthenticated ? '/players' : '/login';
    return NextResponse.redirect(new URL(destination, request.url));
  }

  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL('/players', request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
