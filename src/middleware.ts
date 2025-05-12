import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');
  const isLoginPage = request.nextUrl.pathname.startsWith('/admin/login');

  // Debug logging
  console.log('Middleware check:', {
    path: request.nextUrl.pathname,
    isAdminRoute,
    isLoginPage,
    hasToken: !!token,
    role: token?.role
  });

  // Allow access to login page
  if (isLoginPage) {
    if (token && token.role === 'admin') {
      // If user is already logged in as admin, redirect to admin dashboard
      console.log('Already logged in, redirecting to admin dashboard');
      return NextResponse.redirect(new URL('/admin', request.url));
    }
    return NextResponse.next();
  }

  // Protect admin routes (except login)
  if (isAdminRoute) {
    if (!token) {
      // Redirect unauthenticated users to login page
      console.log('No token found, redirecting to login');
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    if (token.role !== 'admin') {
      // Redirect non-admin users to home page
      console.log('Not admin role, redirecting to home');
      return NextResponse.redirect(new URL('/', request.url));
    }
    
    // Admin user accessing admin route - allow
    console.log('Admin access granted to admin route');
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*']
};
