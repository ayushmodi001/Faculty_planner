import { useEffect, useState } from 'react';
import { verifyJWT } from '@/lib/auth';

export type UserRole = 'PRINCIPAL' | 'HOD' | 'FACULTY' | 'STUDENT' | 'ADMIN';
export type FacultyType = 'SENIOR' | 'JUNIOR' | null;

export interface RBACSession {
    sub: string;
    email: string;
    role: UserRole;
    name: string;
    department_id: string | null;
    facultyGroupId: string | null;
    facultyGroupIds: string[];
    facultyType: FacultyType;
    mustChangePassword: boolean;
}

// Derived permission helpers
export function canEditContent(session: RBACSession | null): boolean {
    if (!session) return false;
    if (session.role === 'PRINCIPAL' || session.role === 'ADMIN' || session.role === 'HOD') return true;
    if (session.role === 'FACULTY' && session.facultyType === 'SENIOR') return true;
    return false;
}

export function canManageUsers(session: RBACSession | null): boolean {
    if (!session) return false;
    return session.role === 'PRINCIPAL' || session.role === 'ADMIN' || session.role === 'HOD';
}

export function canAccessHolidaySettings(session: RBACSession | null): boolean {
    if (!session) return false;
    return session.role === 'PRINCIPAL' || session.role === 'ADMIN';
}

export function canManageDepartments(session: RBACSession | null): boolean {
    if (!session) return false;
    return session.role === 'PRINCIPAL' || session.role === 'ADMIN';
}

export function isReadOnly(session: RBACSession | null): boolean {
    if (!session) return true;
    if (session.role === 'STUDENT') return true;
    if (session.role === 'FACULTY' && session.facultyType === 'JUNIOR') return true;
    return false;
}

/**
 * Client-side hook to read the current session from the API.
 * Returns null while loading, null if unauthenticated.
 */
export function useRBAC() {
    const [session, setSession] = useState<RBACSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/user/me')
            .then(r => r.ok ? r.json() : null)
            .then(data => {
                if (data?.user) setSession(data.user as RBACSession);
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    return {
        session,
        loading,
        canEdit: canEditContent(session),
        canManageUsers: canManageUsers(session),
        canAccessHolidaySettings: canAccessHolidaySettings(session),
        canManageDepartments: canManageDepartments(session),
        isReadOnly: isReadOnly(session),
        isPrincipal: session?.role === 'PRINCIPAL' || session?.role === 'ADMIN',
        isHOD: session?.role === 'HOD',
        isFaculty: session?.role === 'FACULTY',
        isSeniorFaculty: session?.role === 'FACULTY' && session?.facultyType === 'SENIOR',
        isJuniorFaculty: session?.role === 'FACULTY' && session?.facultyType === 'JUNIOR',
        isStudent: session?.role === 'STUDENT',
    };
}
