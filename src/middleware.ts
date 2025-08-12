import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Public routes that don't require authentication
  const publicRoutes = ['/login/admin', '/login/user', '/register', '/forgot-password'];
  const isPublicRoute = publicRoutes.includes(pathname);

  // If user is not authenticated and trying to access protected route
  if (!token && !isPublicRoute && pathname !== '/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If user is authenticated and trying to access auth routes
  if (token && isPublicRoute) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  // Note: We can't check user role here without making an API call
  // Role-based protection will be handled in the component level

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};