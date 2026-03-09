import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface LogoProps {
    className?: string;
    showText?: boolean; // Kept for backward compatibility, but we might just show image
    size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, showText = true, size = 'md' }: LogoProps) {
    const dimensions = {
        sm: 24,
        md: 40,
        lg: 64
    };

    const currentSize = dimensions[size] || 40;

    return (
        <div className={cn("inline-flex items-center gap-2 select-none", className)}>
            <Image
                src="/l.png"
                alt="University Logo"
                width={currentSize}
                height={currentSize}
                className="object-contain shrink-0"
                priority
            />
            {showText && (
                <span className="font-black tracking-tighter text-foreground">UAPS</span>
            )}
        </div>
    );
}
