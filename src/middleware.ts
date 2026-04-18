import { NextResponse, type NextRequest } from 'next/server';

const sessionCookieName = 'carloi_web_session';

const protectedPrefixes = ['/feed', '/messages', '/ai', '/search', '/profile/edit', '/settings'];
const authPrefixes = ['/login', '/register', '/verify-email', '/forgot-password', '/reset-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get(sessionCookieName)?.value);

  const isProtected =
    protectedPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)) ||
    pathname === '/profile';
  const isAuthPage = authPrefixes.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`));

  if (isProtected && !hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (isAuthPage && hasSession) {
    const url = request.nextUrl.clone();
    url.pathname = '/feed';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/feed/:path*', '/messages/:path*', '/ai/:path*', '/search/:path*', '/profile/:path*', '/settings/:path*', '/login', '/register', '/verify-email', '/forgot-password', '/reset-password'],
};
