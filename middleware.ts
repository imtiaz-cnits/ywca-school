import { jwtVerify } from 'jose';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'ywca_school_super_secret_jwt_key_2025';
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get('auth_token')?.value;

  // 1. If no token on protected page, redirect to login
  if (!token) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Unauthorized. Please login.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  try {
    const { payload } = await jwtVerify(token, secretKey);
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-user-id', String(payload.userId));
    requestHeaders.set('x-user-role', String(payload.role));

    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  } catch {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ success: false, message: 'Invalid or expired token.' }, { status: 401 });
    }
    const loginUrl = new URL('/login', request.url);
    const response = NextResponse.redirect(loginUrl);
    response.cookies.delete('auth_token');
    return response;
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/academic/:path*',
    '/students/:path*',
    '/staff/:path*',
    '/attendance/:path*',
    '/sms/:path*',
    '/settings/:path*',
    '/api/academic/:path*',
    '/api/students/:path*',
    '/api/employees/:path*',
    '/api/attendance/student/:path*',
    '/api/attendance/employee/:path*',
    '/api/attendance/manual/:path*',
    '/api/sms/:path*',
    '/api/dashboard/:path*',
  ],
};
