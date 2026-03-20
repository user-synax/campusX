import { NextResponse } from 'next/server';
import { verifyToken } from './lib/auth-edge';

const protectedRoutes = ['/feed', '/profile', '/community', '/bookmarks'];

export async function middleware(request) {
  const { pathname } = request.nextUrl;

  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));

  if (isProtectedRoute) {
    const token = request.cookies.get('campusx_token')?.value;

    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }

    const decoded = await verifyToken(token);

    if (!decoded) {
      const response = NextResponse.redirect(new URL('/login?reason=expired', request.url));
      response.cookies.set('campusx_token', '', { maxAge: 0 });
      return response;
    }

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', decoded.userId);

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/feed/:path*', '/profile/:path*', '/community/:path*', '/bookmarks/:path*'],
};
