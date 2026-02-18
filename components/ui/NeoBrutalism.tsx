import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface NeoCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
    color?: 'default' | 'red' | 'green' | 'blue' | 'yellow' | 'purple';
    hoverEffect?: boolean;
}

const colorMap = {
    default: 'bg-white border-black text-black',
    red: 'bg-red-200 border-red-900 text-red-950',
    green: 'bg-green-200 border-green-900 text-green-950',
    blue: 'bg-blue-200 border-blue-900 text-blue-950',
    yellow: 'bg-yellow-200 border-yellow-900 text-yellow-950',
    purple: 'bg-purple-200 border-purple-900 text-purple-950',
};

const shadowMap = {
    default: 'shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]',
    hover: 'hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] active:translate-x-[0px] active:translate-y-[0px] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]',
};

export function NeoCard({
    children,
    className,
    color = 'default',
    hoverEffect = false,
    ...props
}: NeoCardProps) {
    return (
        <div
            className={cn(
                'border-2 p-6 transition-all duration-200 ease-in-out',
                colorMap[color],
                shadowMap.default,
                hoverEffect && shadowMap.hover,
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function NeoButton({
    children,
    className,
    variant = 'primary',
    ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger' }) {

    const variants = {
        primary: 'bg-blue-600 text-white border-blue-900 hover:bg-blue-700',
        secondary: 'bg-white text-black border-black hover:bg-gray-50',
        danger: 'bg-red-600 text-white border-red-900 hover:bg-red-700'
    };

    return (
        <button
            className={cn(
                'px-6 py-2 font-bold border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] transition-all active:shadow-[0px_0px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px]',
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}
