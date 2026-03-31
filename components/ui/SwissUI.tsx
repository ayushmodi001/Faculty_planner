import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Typography ---

export function SwissHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn("text-3xl font-black tracking-tight text-[#0A1128] dark:text-slate-100", className)} {...props}>
            {children}
        </h2>
    );
}

export function SwissSubHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3 className={cn("text-[10px] font-black uppercase tracking-[0.2em] text-slate-400", className)} {...props}>
            {children}
        </h3>
    );
}

// --- Cards ---

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

export function Card({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-3xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-card text-foreground shadow-sm transition-all hover:shadow-md",
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

export function CardDescription({ children, className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
    return <p className={cn("text-sm text-slate-500 font-medium dark:text-slate-400 leading-relaxed", className)} {...props}>{children}</p>;
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("font-black leading-none tracking-tight text-[#0A1128] dark:text-white uppercase", className)} {...props}>{children}</h3>;
}

export function CardContent({ children, className, ...props }: CardProps) {
    return <div className={cn("p-6 pt-0", className)} {...props}>{children}</div>;
}

// --- Premium Components ---

export function PremiumStatCard({ label, value, icon: Icon, color, textColor, trend }: any) {
    return (
        <Card className={cn("p-8 rounded-[32px] border-none shadow-xl overflow-hidden relative group transition-all hover:scale-[1.02]", color)}>
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none transition-transform group-hover:scale-110">
                <Icon className="w-20 h-20 -mr-6 -mt-6" />
            </div>
            <div className="relative z-10 space-y-3">
                <div className="flex items-center justify-between">
                    <p className={cn("text-[9px] font-black uppercase tracking-widest opacity-60", textColor)}>{label}</p>
                    {trend && (
                        <div className={cn("text-[9px] font-black px-2 py-0.5 rounded-lg bg-white/10", textColor)}>
                            {trend}
                        </div>
                    )}
                </div>
                <div className={cn("text-4xl font-black tracking-tighter leading-none", textColor)}>{value}</div>
            </div>
        </Card>
    );
}

export function GlassCard({ children, className, ...props }: CardProps) {
    return (
        <div
            className={cn(
                "rounded-[32px] border border-white/10 bg-white/5 backdrop-blur-xl text-white shadow-2xl relative overflow-hidden",
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
}

// --- Buttons ---

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive' | 'orange' | 'navy';
    size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({ children, className, variant = 'primary', size = 'md', ...props }: ButtonProps) {
    const variants = {
        primary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5",
        secondary: "bg-slate-100 dark:bg-slate-800 text-[#0A1128] dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700",
        outline: "border border-slate-200 dark:border-slate-800 bg-transparent text-[#0A1128] dark:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-blue-500",
        ghost: "bg-transparent hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-500 hover:text-[#0A1128] dark:hover:text-white",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-600/20 hover:-translate-y-0.5",
        orange: "bg-[#FD5E19] text-white hover:bg-[#FD5E19]/90 shadow-xl shadow-orange-600/20 hover:-translate-y-0.5",
        navy: "bg-[#0A1128] dark:bg-slate-900 text-white hover:bg-[#0A1128]/90 dark:hover:bg-black shadow-xl shadow-slate-900/20 hover:-translate-y-0.5",
    };

    const sizes = {
        sm: "h-9 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest",
        md: "h-11 rounded-2xl px-6 text-[11px] font-black uppercase tracking-widest",
        lg: "h-14 rounded-[20px] px-10 text-[12px] font-black uppercase tracking-[0.2em]",
        icon: "h-11 w-11 rounded-xl p-0",
    };

    return (
        <button
            className={cn(
                "inline-flex items-center justify-center whitespace-nowrap font-black transition-all active:scale-[0.97] disabled:pointer-events-none disabled:opacity-50 gap-2",
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

export function Badge({ children, variant = "default", className }: { children: React.ReactNode, variant?: "default" | "success" | "warning" | "destructive" | "primary" | "orange" | "outline" | "secondary" | "navy", className?: string }) {
    const badgeVariants = {
        default: "border-transparent bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400",
        success: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20",
        warning: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-500/20",
        destructive: "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-500/20",
        primary: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-500/20",
        orange: "bg-orange-50 dark:bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-200 dark:border-orange-500/20",
        outline: "bg-transparent border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400",
        secondary: "bg-slate-800 dark:bg-slate-700 text-white border border-slate-700 dark:border-slate-600",
        navy: "bg-[#0A1128] dark:bg-slate-100 text-white dark:text-[#0A1128] border-none",
    }

    return (
        <div className={cn("inline-flex items-center rounded-xl border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all", badgeVariants[variant], className)}>
            {children}
        </div>
    )
}
