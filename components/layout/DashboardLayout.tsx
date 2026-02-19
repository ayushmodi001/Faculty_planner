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
            {/* Navigation Bar - Consistent across all pages */}
            <nav className="border-b bg-background/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {!isMainDashboard && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="mr-2 rounded-full h-8 w-8 p-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}

                        <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Logo />
                            <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider shadow-sm">
                                {role} Portal
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-muted rounded-full border text-xs font-bold text-muted-foreground">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {role || 'User'} Mode
                        </div>

                        <ModeToggle />
                        <LogoutButton />
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
