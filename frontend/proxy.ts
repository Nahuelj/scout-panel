import { type NextRequest, NextResponse } from 'next/server';

const AUTH_COOKIE = 'better-auth.session_token';

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/login', '/register'];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get(AUTH_COOKIE);
  const isAuthenticated = Boolean(sessionCookie?.value);

  if (pathname === '/') {
    const destination = isAuthenticated ? '/dashboard' : '/login';
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
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/dashboard/:path*', '/login', '/register'],
};
