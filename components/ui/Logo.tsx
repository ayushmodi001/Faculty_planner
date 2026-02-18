import React from 'react';
import { cn } from '@/lib/utils';

interface LogoProps {
    className?: string;
    showText?: boolean;
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
    const sizeClasses = {
        sm: "w-6 h-6",
        md: "w-8 h-8",
        lg: "w-12 h-12"
    };

    const textSizes = {
        sm: "text-lg",
        md: "text-xl",
        lg: "text-3xl"
    };

    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            {/* Logo Mark: A stylized Abstract 'U' / Grid Element */}
            <div className={cn("bg-primary rounded-lg flex items-center justify-center text-primary-foreground font-bold shadow-sm relative overflow-hidden", sizeClasses[size])}>
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-2/3 h-2/3">
                    <path d="M4 6V15C4 18 7 20 10 20H14C17 20 20 18 20 15V6" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                    <circle cx="12" cy="12" r="2" fill="currentColor" className="opacity-50" />
                </svg>
                {/* Subtle sheen effect */}
                <div className="absolute top-0 right-0 w-full h-full bg-linear-to-bl from-white/20 to-transparent pointer-events-none"></div>
            </div>

            {showText && (
                <div className="flex flex-col justify-center">
                    <span className={cn("font-extrabold tracking-tight leading-none text-foreground", textSizes[size])}>
                        UAPS
                    </span>
                    {size !== 'sm' && (
                        <span className="text-[0.6rem] font-bold uppercase tracking-widest text-muted-foreground leading-tight">
                            System
                        </span>
                    )}
                </div>
            )}
        </div>
    );
}
