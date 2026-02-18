import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button'; // Usage of shadcn button
import { Home, LogOut } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

interface DashboardLayoutProps {
    children: React.ReactNode;
    role?: 'HOD' | 'Principal' | 'Faculty' | 'Student';
}

export default function DashboardLayout({ children, role = 'HOD' }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen flex flex-col font-sans text-foreground bg-background bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">

            {/* Navigation Bar - Consistent across all pages */}
            <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
                <div className="container mx-auto px-4 h-14 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
                            <Logo />
                            <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider border border-border">
                                {role} Portal
                            </span>
                        </Link>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* Role Switcher for Demo Purposes */}
                        <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground mr-4 border-r pr-4">
                            <Link href="/dashboard/principal" className={`px-2 py-1 rounded hover:text-foreground ${role === 'Principal' ? 'text-foreground font-semibold bg-muted' : ''}`}>Principal</Link>
                            <Link href="/dashboard/hod" className={`px-2 py-1 rounded hover:text-foreground ${role === 'HOD' ? 'text-foreground font-semibold bg-muted' : ''}`}>HOD</Link>
                            <Link href="/dashboard/faculty" className={`px-2 py-1 rounded hover:text-foreground ${role === 'Faculty' ? 'text-foreground font-semibold bg-muted' : ''}`}>Faculty</Link>
                            <Link href="/dashboard/student" className={`px-2 py-1 rounded hover:text-foreground ${role === 'Student' ? 'text-foreground font-semibold bg-muted' : ''}`}>Student</Link>
                        </div>

                        <Button variant="ghost" size="sm" asChild>
                            <Link href="/">
                                <LogOut className="w-4 h-4 mr-2" />
                                Exit
                            </Link>
                        </Button>
                    </div>
                </div>
            </nav>

            <main className="flex-1 container mx-auto px-4 py-8 md:py-12 animate-in fade-in duration-500">
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
