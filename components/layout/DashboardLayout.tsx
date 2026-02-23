'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LogoutButton from './LogoutButton';
import { Home, LogOut, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { ModeToggle } from '@/components/mode-toggle';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: 'HOD' | 'Principal' | 'Faculty' | 'Student';
}

export default function DashboardLayout({ children, role = 'HOD' }: DashboardLayoutProps) {
    const router = useRouter();
    const pathname = usePathname();

    // Don't show back button on main dashboard pages
    const isMainDashboard = pathname === `/dashboard/${role?.toLowerCase()}`;

    return (
        <div className="min-h-screen flex flex-col font-sans bg-background text-foreground transition-colors duration-300">
            {/* Modern Navigation Bar */}
            <nav className="sticky top-0 z-50 px-4 pt-4 pb-2">
                <div className="container mx-auto max-w-7xl">
                    <div className="h-16 flex items-center justify-between bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm rounded-2xl px-6 transition-all duration-300">
                        <div className="flex items-center gap-4">
                            {!isMainDashboard && (
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => router.back()}
                                    className="mr-1 rounded-full hover:bg-muted"
                                >
                                    <ArrowLeft className="w-5 h-5 text-muted-foreground" />
                                </Button>
                            )}

                            <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center gap-3 hover:opacity-90 transition-opacity">
                                <Logo />
                                <span className="px-3 py-1 pb-1.5 rounded-full bg-foreground text-background text-[10px] font-bold uppercase tracking-widest shadow-sm flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                                    {role} Portal
                                </span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-3">
                            <ModeToggle />
                            <div className="h-6 w-px bg-border/50 mx-1"></div>
                            <LogoutButton />
                        </div>
                    </div>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-6 py-8 md:py-12 animate-in fade-in duration-500 relative z-10">
                {children}
            </main>

            <footer className="border-t py-6 bg-background/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 text-center text-xs text-muted-foreground">
                    <p>© 2026 University Academic Planning System. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
}
