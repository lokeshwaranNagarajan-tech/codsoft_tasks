import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { verifyJwtWebCrypto } from './lib/jwt-verify';
import { env } from '@/env.mjs'; // Assuming you have env helper or use process.env directly

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('amcet_token')?.value;
  const secret = process.env.JWT_SECRET ?? '';
  const payload = token ? await verifyJwtWebCrypto(token, secret) : null;

  // Public asset bypass
  if (pathname.startsWith('/_next') || pathname.startsWith('/public') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Login page: redirect already-authenticated users to their dashboard
  if (pathname === '/login') {
    if (payload?.role) {
      if (payload.role === 'PRIMARY_ADMIN' || payload.role === 'SECONDARY_ADMIN') {
        return NextResponse.redirect(new URL('/admin', request.url));
      } else if (payload.role === 'FACULTY') {
        return NextResponse.redirect(new URL('/faculty', request.url));
      } else if (payload.role === 'STUDENT') {
        return NextResponse.redirect(new URL('/student', request.url));
      }
    }
    return NextResponse.next();
  }

  // Root redirect
  if (pathname === '/') {
    if (!payload) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
    if (payload.role === 'PRIMARY_ADMIN' || payload.role === 'SECONDARY_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    } else if (payload.role === 'FACULTY') {
      return NextResponse.redirect(new URL('/faculty', request.url));
    } else if (payload.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/student', request.url));
    }
  }

  // Unauthenticated access to protected routes
  if (!payload) {
    if (
      pathname.startsWith('/admin') ||
      pathname.startsWith('/faculty') ||
      pathname.startsWith('/student')
    ) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Role-based route enforcement
  if (payload) {
    // Only PRIMARY_ADMIN can access /admin/admins
    if (pathname.startsWith('/admin/admins') && payload.role !== 'PRIMARY_ADMIN') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Only admins can access /admin
    if (
      pathname.startsWith('/admin') &&
      payload.role !== 'PRIMARY_ADMIN' &&
      payload.role !== 'SECONDARY_ADMIN'
    ) {
      if (payload.role === 'FACULTY') return NextResponse.redirect(new URL('/faculty', request.url));
      if (payload.role === 'STUDENT') return NextResponse.redirect(new URL('/student', request.url));
    }

    // Students cannot access faculty routes
    if (pathname.startsWith('/faculty') && payload.role === 'STUDENT') {
      return NextResponse.redirect(new URL('/student', request.url));
    }

    // Faculty cannot access student routes
    if (pathname.startsWith('/student') && payload.role === 'FACULTY') {
      return NextResponse.redirect(new URL('/faculty', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
