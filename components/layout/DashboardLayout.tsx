'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import LogoutButton from './LogoutButton';
import { Home, LogOut, ChevronLeft, ArrowLeft } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

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
        <div className="min-h-screen flex flex-col font-sans text-[#283618] bg-[#FEFAE0] selection:bg-[#A6835B] selection:text-white">
            {/* Subtle Texture Overlay */}
            <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

            {/* Navigation Bar - Consistent across all pages */}
            <nav className="border-b border-[#C9C3A3]/50 bg-[#FEFAE0]/80 backdrop-blur-md sticky top-0 z-50">
                <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {!isMainDashboard && (
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.back()}
                                className="mr-2 text-[#5C6836] hover:text-[#283618] hover:bg-[#C9C3A3]/20 rounded-full h-8 w-8 p-0"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Button>
                        )}

                        <Link href={`/dashboard/${role.toLowerCase()}`} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Logo />
                            <span className="px-3 py-1 rounded-full bg-[#283618] text-[#FEFAE0] text-xs font-bold uppercase tracking-wider shadow-sm">
                                {role} Portal
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-[#E9E5D0] rounded-full border border-[#C9C3A3] text-xs font-bold text-[#5C6836]">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                            {role || 'User'} Mode
                        </div>

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
