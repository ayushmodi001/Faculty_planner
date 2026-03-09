import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';

const publicRoutes = ['/login', '/', '/reset-password'];
const publicApiRoutes = ['/api/auth/login', '/api/auth/request-reset', '/api/auth/verify-reset'];
// Routes only accessible when mustChangePassword is true (or normally authenticated)
const passwordGatedRoutes = ['/force-change-password'];

export default async function proxy(req: NextRequest) {
    const path = req.nextUrl.pathname;

    // Helper to check public routes
    const isPublicRoute = publicRoutes.includes(path) || publicApiRoutes.some(route => path.startsWith(route));

    // 1. Get Session
    const cookie = req.cookies.get('session')?.value;
    const session = cookie ? await verifyJWT(cookie) : null;

    // Helper to get correct dashboard for a role
    const getRoleDashboardUrl = (role: string) => {
        if (role === 'ADMIN') return '/admin';
        if (role === 'PRINCIPAL') return '/dashboard/principal';
        if (role === 'HOD') return '/dashboard/hod';
        if (role === 'FACULTY') return '/dashboard/faculty';
        if (role === 'STUDENT') return '/dashboard/student';
        return '/login';
    };    // 2. Redirect logged-in users away from /login only
    if (path === '/login' && session) {
        return NextResponse.redirect(new URL(getRoleDashboardUrl(session.role as string), req.nextUrl));
    }

    // 3. Strictly Protect All Other Routes
    if (!isPublicRoute && !session) {
        if (path.startsWith('/api/')) {
            return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/login', req.nextUrl));
    }

    // 4. If user must change password, block everything except the change-password page/api
    if (session && (session as any).mustChangePassword) {
        const allowed = passwordGatedRoutes.some(r => path.startsWith(r)) || path === '/api/user/password';
        if (!allowed) {
            return NextResponse.redirect(new URL('/force-change-password', req.nextUrl));
        }
    }

    // 4. Strict Role-Based Access Control (RBAC)
    if (session) {
        const role = session.role as string;

        const handleUnauthorized = () => {
            if (path.startsWith('/api/')) {
                return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
            }
            return NextResponse.redirect(new URL(getRoleDashboardUrl(role), req.nextUrl));
        };

        // Admin section: Only Principal, HOD, and Super Admin
        if (path.startsWith('/admin') || path.startsWith('/api/admin')) {
            if (!['PRINCIPAL', 'HOD', 'ADMIN'].includes(role)) {
                return handleUnauthorized();
            }
        }

        // Dashboard boundary checks - Force users into their lane
        if (path.startsWith('/dashboard/principal') && role !== 'PRINCIPAL') {
            return handleUnauthorized();
        }

        if (path.startsWith('/dashboard/hod') && role !== 'HOD') {
            return handleUnauthorized();
        }

        if (path.startsWith('/dashboard/faculty') && role !== 'FACULTY') {
            return handleUnauthorized();
        }

        if (path.startsWith('/dashboard/student') && role !== 'STUDENT') {
            return handleUnauthorized();
        }
    }

    return NextResponse.next();
}

export const config = {
    // Only run middleware on navigation and api routes, bypass static files and images
    matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.svg$).*)'],
};
