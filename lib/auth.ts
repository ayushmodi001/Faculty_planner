import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';

const SECRET_KEY = process.env.JWT_SECRET_KEY || 'uaps-super-secret-key-change-in-prod-v1';
const key = new TextEncoder().encode(SECRET_KEY);

export async function hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(12); // Cost factor 12: Good balance of security/performance
    return bcrypt.hash(password, salt);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
}

export async function signJWT(payload: any) {
    return await new SignJWT(payload)
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('24h') // 24 hour session
        .sign(key);
}

export async function verifyJWT(token: string) {
    try {
        const { payload } = await jwtVerify(token, key, {
            algorithms: ['HS256'],
        });
        return payload;
    } catch (error) {
        return null;
    }
}

export async function login(user: any) {
    // Determine redirect based on role
    let redirectUrl = '/dashboard/student';
    switch (user.role) {
        case 'ADMIN': redirectUrl = '/dashboard/admin'; break;
        case 'PRINCIPAL': redirectUrl = '/dashboard/principal'; break;
        case 'HOD': redirectUrl = '/dashboard/hod'; break;
        case 'FACULTY': redirectUrl = '/dashboard/faculty'; break;
        case 'STUDENT': redirectUrl = '/dashboard/student'; break;
    }

    // Create session token
    const token = await signJWT({
        sub: user._id,
        email: user.email,
        role: user.role,
        name: user.name
    });

    // Set HTTP-only cookie
    (await cookies()).set('session', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day
    });

    return redirectUrl;
}

export async function logout() {
    (await cookies()).delete('session');
}

export async function getSession() {
    const session = (await cookies()).get('session')?.value;
    if (!session) return null;
    return await verifyJWT(session);
}

export async function updateSession(request: NextRequest) {
    const session = request.cookies.get('session')?.value;
    if (!session) return;

    // Refresh session expiration on activity
    const parsed = await verifyJWT(session);
    if (!parsed) return;

    // In a real app, you might want to re-sign a new token here to extend the session
    // For now, we rely on the cookie maxAge, but middleware could refresh it.
    const res = NextResponse.next();
    res.cookies.set({
        name: 'session',
        value: session,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 // 1 day extension
    });
    return res;
}
