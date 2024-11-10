import { NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import type { NextRequest } from 'next/server';

export async function middleware(req: NextRequest) {
    const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
    const { pathname } = req.nextUrl;

    // Allow access to login page without authentication
    if (pathname === ('/login') || pathname === ('/register')) {
        return NextResponse.next();
    }

    // If session exists, continue to the requested page
    if (session) {
        return NextResponse.next();
    }

    // If no session, redirect to the login page
    const loginUrl = req.nextUrl.clone();
    loginUrl.pathname = '/login';
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
}

export const config = {
    matcher: [
        '/',
        '/chat/:path*',
        '/((?!api|_next/static|_next/image|favicon.ico|favicon.svg).*)',
    ],
};
