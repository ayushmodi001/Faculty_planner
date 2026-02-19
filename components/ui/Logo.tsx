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
    // Mapping size prop to image dimensions
    const dimensions = {
        sm: 24,
        md: 40,
        lg: 64
    };

    const currentSize = dimensions[size] || 40;

    return (
        <div className={cn("flex items-center gap-2 select-none", className)}>
            <div className="relative">
                <Image
                    src="/l.png"
                    alt="University Logo"
                    width={currentSize}
                    height={currentSize}
                    className="object-contain"
                    priority
                />
            </div>

            {showText && (
                <div className="flex flex-col justify-center">
                    <span className={cn("font-extrabold tracking-tight leading-none text-foreground",
                        size === 'sm' ? "text-lg" : size === 'lg' ? "text-3xl" : "text-xl"
                    )}>
                        UAPS
                    </span>
                </div>
            )}
        </div>
    );
}
