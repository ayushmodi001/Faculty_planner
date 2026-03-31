'use client';

import React from 'react';
import Link from 'next/link';
import { ModeToggle } from '@/components/mode-toggle';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import UserNav from './UserNav';
import { ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: 'HOD' | 'Admin' | 'Faculty' | 'Student' | 'Principal';
    departmentName?: string;  // shown in nav for HOD
}

// Resolves the home dashboard path for each role
function getDashboardHref(role: string) {
    if (role === 'Faculty') return '/dashboard/faculty';
    if (role === 'Student') return '/dashboard/student';
    if (role === 'Principal') return '/dashboard/principal';
    // HOD and Admin both land on the HOD dashboard overview
    return '/dashboard/hod';
}

export default function DashboardLayout({ children, role = 'HOD', departmentName }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    const dashboardHref = getDashboardHref(role);

    // Don't show back button on main dashboard pages
    const isMainDashboard = pathname === dashboardHref;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
            {/* Header Navigation */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md mt-0 transition-all">
                <div className="container mx-auto h-14 md:h-16 flex items-center justify-between px-4 md:px-6">
                    <div className="flex items-center gap-6">
                        {!isMainDashboard && (
                            <button
                                onClick={() => router.back()}
                                className="w-8 h-8 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                            >
                                <ArrowLeft className="w-4 h-4" />
                            </button>
                        )}                        <Link href={dashboardHref} className="flex items-center gap-4 transition-all active:scale-95 group">
                            <Logo size="md" showText={false} className="shrink-0" />
                            <div className="flex flex-col border-l border-border/40 pl-4 py-0.5">
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/70 leading-none">
                                    {role === 'Admin' ? 'HOD' : role}
                                </span>
                                {departmentName ? (
                                    <span className="text-[9px] font-black text-primary uppercase tracking-widest mt-0.5">
                                        {departmentName}
                                    </span>
                                ) : (
                                    <span className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Management</span>
                                )}
                            </div>
                        </Link>

                        <div className="hidden lg:flex items-center gap-1 ml-4 pt-1">
                            <NavItem href={dashboardHref} label="Overview" active={isMainDashboard} />

                            {/* Role based Nav */}
                            {role === 'Faculty' ? (
                                <>
                                    <NavItem href="/dashboard/faculty/calendar" label="Calendar" active={pathname.includes('/calendar')} />
                                    <NavItem href="/dashboard/faculty/planner" label="Syllabus" active={pathname.includes('/planner')} />
                                </>
                            ) : role === 'Student' ? (
                                <>
                                    <NavItem href="/dashboard/student/calendar" label="Calendar" active={pathname.includes('/calendar')} />
                                    <NavItem href="/dashboard/student/planner" label="Syllabus" active={pathname.includes('/planner')} />
                                </>                            ) : (
                                <>
                                    <NavItem href="/admin/calendar" label="Calendar" active={pathname.includes('/calendar')} />
                                    <NavItem href="/admin/timetable" label="Timetable" active={pathname.includes('/timetable')} />
                                    <NavItem href="/admin/planner" label="Planner" active={pathname.includes('/planner')} />
                                    <NavItem href="/admin/faculty" label="Groups" active={pathname.startsWith('/admin/faculty')} />
                                    <NavItem href="/admin/subjects" label="Subjects" active={pathname.includes('/subjects')} />
                                    <NavItem href="/admin/users" label="Users" active={pathname.includes('/users')} />
                                </>
                            )}
                            <NavItem href="/settings" label="Settings" active={pathname.includes('/settings')} />
                        </div>
                    </div>                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center gap-1">
                            <ModeToggle />
                        </div>
                        <div className="h-4 w-px bg-border mx-1 hidden sm:block"></div>
                        <UserNav />
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1 w-full px-4 md:px-8 lg:px-12 py-8 md:py-12 animate-in fade-in slide-in-from-bottom-2 duration-700 mx-auto">
                {children}
            </main>

            <footer className="py-8 border-t bg-muted/10 mt-auto">
                <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">University Academic Planning System © 2026</span>
                    </div>
                    <div className="flex gap-6 text-[9px] font-black text-muted-foreground uppercase tracking-widest">
                        <Link href="#" className="hover:text-primary transition-colors">Support</Link>
                        <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
                        <Link href="#" className="hover:text-primary transition-colors">API Docs</Link>
                    </div>
                </div>
            </footer>
        </div>
    );
}

function NavItem({ href, label, active }: { href: string, label: string, active: boolean }) {
    return (
        <Link href={href}>
            <div className={cn(
                "px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all duration-200",
                active ? "text-primary bg-primary/10 shadow-sm" : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}>
                {label}
            </div>
        </Link>
    );
}
