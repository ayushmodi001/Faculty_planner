import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Typography ---

export function SwissHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn("text-3xl font-bold tracking-tight text-foreground", className)} {...props}>
            {children}
        </h2>
    );
}

export function SwissSubHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-xs font-bold uppercase tracking-widest text-muted-foreground", className)} {...props}>
            {children}
        </h3>
    );
}

// --- Cards (Shadcn Style) ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-lg border border-border bg-card text-card-foreground shadow-sm transition-all hover:shadow-md",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

export function CardHeader({ children, className, ...props }: CardProps) {
    return <div className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}>{children}</div>;
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("font-semibold leading-none tracking-tight", className)} {...props}>{children}</h3>;
}

export function CardContent({ children, className, ...props }: CardProps) {
    return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}

// --- Buttons ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
    size?: 'sm' | 'md' | 'lg';
}

export function Button({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    const variants = {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm",
        secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        outline: "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
        ghost: "hover:bg-accent hover:text-accent-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm",
    };

    const sizes = {
        sm: "h-8 rounded-md px-3 text-xs",
        md: "h-9 px-4 py-2",
        lg: "h-10 rounded-md px-8",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                variants[variant],
                sizes[size],
                className
            )}
            {...props}
        >
            {children}
        </button>
    );
}

// --- Badges ---

export function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "destructive", className?: string }) {
    const badgeVariants = {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        success: "border-transparent bg-green-500 text-white hover:bg-green-600",
        warning: "border-transparent bg-yellow-500 text-white hover:bg-yellow-600",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
    }

    return (
        <div className={cn("inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2", badgeVariants[variant], className)}>
            {children}
        </div>
    )
}
