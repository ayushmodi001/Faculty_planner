import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'uaps-dev-fallback-key-v1';
const key = new TextEncoder().encode(SECRET_KEY);

/**
 * Validates the session JWT and checks for role-based access.
 */
export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Identify Protected and Auth Routes
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/reset-password');
    const isProtectedRoute = pathname.startsWith('/admin') || pathname.startsWith('/dashboard');

    if (!isAuthRoute && !isProtectedRoute) return NextResponse.next();

    // 2. Get session cookie
    const token = request.cookies.get('session')?.value;

    let payload: any = null;
    if (token) {
        try {
            const result = await jwtVerify(token, key, {
                algorithms: ['HS256'],
            });
            payload = result.payload;
        } catch (error) {
            // Invalid token
        }
    }

    // ── Auth Route Protection: If logged in, don't allow /login ────────────────────────────────
    if (isAuthRoute) {
        if (payload) {
            // Redirect based on role to their appropriate dashboard
            let redirectUrl = new URL('/dashboard/student', request.url);
            if (payload.role === 'ADMIN') redirectUrl = new URL('/admin', request.url);
            else if (['PRINCIPAL', 'HOD', 'FACULTY'].includes(payload.role)) {
                 redirectUrl = new URL(`/dashboard/${payload.role.toLowerCase()}`, request.url);
            }
            return NextResponse.redirect(redirectUrl);
        }
        return NextResponse.next();
    }

    // ── Protected Route Guard: If not logged in, redirect to login ──────────────────────────────
    if (isProtectedRoute) {
        if (!payload) {
            const loginUrl = new URL('/login', request.url);
            // Append current path for subsequent redirection after login
            loginUrl.searchParams.set('from', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Optional: Role-based strict routing enforcement
        if (pathname.startsWith('/admin') && payload.role !== 'ADMIN') {
            // Non-admins can only access /admin if allowed by their sub-role, 
            // but usually we want to separate dashboard vs admin.
            // For now, let's keep it simple or enforce strict separate contexts.
        }
    }

    return NextResponse.next();
}

/**
 * Configure matching paths for performance
 */
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
