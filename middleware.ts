import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const protectedRoutes = ['/dashboard', '/admin'];
const publicRoutes = ['/login', '/setup-admin', '/', '/api/auth/login', '/api/auth/register'];

export default async function middleware(req: NextRequest) {
    const path = req.nextUrl.pathname;
    const isProtectedRoute = protectedRoutes.some(route => path.startsWith(route));
    const isPublicRoute = publicRoutes.includes(path);

    // 1. Get Session
    const cookie = req.cookies.get('session')?.value;
    const session = cookie ? await verifyJWT(cookie) : null;

    // 2. Redirect logic
    // If trying to access protected route without session -> Login
    if (isProtectedRoute && !session) {
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // If trying to access login or root page while logged in -> Dashboard
    if (isPublicRoute && session && !req.nextUrl.pathname.startsWith('/dashboard')) {
        let dashboardUrl = '/dashboard/student';
        if (session.role === 'ADMIN') dashboardUrl = '/dashboard/admin'; // Assuming admin dashboard exists or redirects
        if (session.role === 'PRINCIPAL') dashboardUrl = '/dashboard/principal';
        if (session.role === 'HOD') dashboardUrl = '/dashboard/hod';
        if (session.role === 'FACULTY') dashboardUrl = '/dashboard/faculty';

        // Avoid redirect loop if already on the correct dashboard (though basic check above handles generic /dashboard)
        return NextResponse.redirect(new URL(dashboardUrl, req.nextUrl));
    }

    return NextResponse.next();
}

// Ensure middleware runs on relevant paths
export const config = {
    matcher: ['/((?!api|_next/static|_next/image|.*\\.png$).*)'],
};
