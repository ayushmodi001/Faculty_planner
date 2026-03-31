'use client';

import React, { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * A sleek, high-end preloader that appears during initial hydration
 * and can be manually triggered during route transitions for heavy pages.
 */
export default function Preloader() {
    const [isLoading, setIsLoading] = useState(true);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // 1. Initial Site Load Preloader (Initial Hydration)
    useEffect(() => {
        // Minimum delay to prevent flickering
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, []);

    // 2. Navigation Preloader (Optional: Trigger on path change)
    useEffect(() => {
        // If we want it on every route change, we set isLoading back to true briefly.
        // But for better UX, usually we use a top-bar progress.
        // For now, let's just stick to the initial mount load.
    }, [pathname, searchParams]);

    if (!isLoading) return null;

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
            {/* Background Grid Accent */}
            <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px] opacity-40" />
            
            {/* Main Content */}
            <div className="relative flex flex-col items-center gap-8 animate-in fade-in zoom-in duration-700">
                <div className="relative">
                    {/* Pulsing Outer Rings */}
                    <div className="absolute -inset-4 rounded-full bg-primary/10 animate-ping duration-[2500ms]" />
                    <div className="absolute -inset-8 rounded-full bg-primary/5 animate-ping duration-[3500ms] delay-500" />
                    
                    {/* Logo/Icon Container */}
                    <div className="relative flex items-center justify-center w-24 h-24 bg-white rounded-full border border-slate-100 shadow-2xl overflow-hidden group">
                        <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-colors" />
                        <Loader2 className="w-10 h-10 text-primary animate-spin-slow" />
                    </div>
                </div>

                <div className="flex flex-col items-center gap-2">
                    <h2 className="text-xl font-black uppercase tracking-[0.25em] text-[#0A1128] drop-shadow-sm">UAPS</h2>
                    <div className="flex items-center gap-2 px-3 py-1 bg-slate-50 border border-slate-100 rounded-full">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Initializing System</span>
                    </div>
                </div>
            </div>

            {/* Bottom Accent Line */}
            <div className="absolute bottom-0 left-0 w-full h-1 bg-slate-50">
                <div className="h-full bg-primary animate-loader-line origin-left" />
            </div>

            <style jsx global>{`
                @keyframes loader-line {
                    0% { transform: scaleX(0); }
                    50% { transform: scaleX(0.7); }
                    100% { transform: scaleX(1); }
                }
                .animate-loader-line {
                    animation: loader-line 1.2s cubic-bezier(0.65, 0, 0.35, 1) forwards;
                }
                .animate-spin-slow {
                    animation: spin 3s linear infinite;
                }
            `}</style>
        </div>
    );
}
