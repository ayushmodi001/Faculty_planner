'use client';

import React from 'react';
import { useRBAC, RBACSession } from '@/hooks/useRBAC';
import { Loader2, Lock } from 'lucide-react';

interface RBACGuardProps {
    /** Children to render if access is granted */
    children: React.ReactNode;
    /** Custom predicate — if provided, overrides `roles` check */
    check?: (session: RBACSession | null) => boolean;
    /** Array of allowed roles (fallback when no custom check) */
    roles?: Array<RBACSession['role']>;
    /** If true, render null instead of a lock message when unauthorized */
    silent?: boolean;
    /** Fallback UI when access is denied */
    fallback?: React.ReactNode;
}

/**
 * Wraps children in an RBAC check.
 *
 * Usage (role-based):
 *   <RBACGuard roles={['PRINCIPAL', 'HOD']}>
 *     <DangerousButton />
 *   </RBACGuard>
 *
 * Usage (custom predicate):
 *   <RBACGuard check={s => s?.role === 'FACULTY' && s?.facultyType === 'SENIOR'}>
 *     <EditButton />
 *   </RBACGuard>
 */
export default function RBACGuard({ children, check, roles, silent = false, fallback }: RBACGuardProps) {
    const { session, loading } = useRBAC();

    if (loading) {
        return (
            <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            </div>
        );
    }

    let allowed = false;
    if (check) {
        allowed = check(session);
    } else if (roles && roles.length > 0) {
        allowed = session !== null && roles.includes(session.role);
    } else {
        // No constraints specified — allow for authenticated users
        allowed = session !== null;
    }

    if (!allowed) {
        if (silent) return null;
        if (fallback) return <>{fallback}</>;
        return (
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted/50 text-muted-foreground text-xs font-medium border border-border/40">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>You don&apos;t have permission to perform this action.</span>
            </div>
        );
    }

    return <>{children}</>;
}
