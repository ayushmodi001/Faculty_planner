import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// --- Typography ---

export function SwissHeading({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h2 className={cn("text-3xl font-black tracking-tight text-[#0A1128]", className)} {...props}>
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
                "rounded-2xl border border-slate-100 bg-white text-foreground shadow-sm transition-all",
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
    return <p className={cn("text-sm text-slate-500 font-medium", className)} {...props}>{children}</p>;
}

export function CardTitle({ children, className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
    return <h3 className={cn("font-black leading-none tracking-tight text-[#0A1128]", className)} {...props}>{children}</h3>;
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
        primary: "bg-[#2563eb] text-white hover:bg-[#1d4ed8] shadow-lg shadow-blue-600/20",
        secondary: "bg-slate-100 text-[#0A1128] hover:bg-slate-200",
        outline: "border border-slate-200 bg-transparent text-[#0A1128] hover:bg-slate-50",
        ghost: "bg-transparent hover:bg-slate-100 text-slate-500 hover:text-[#0A1128]",
        destructive: "bg-rose-500 text-white hover:bg-rose-600 shadow-lg shadow-rose-600/20",
        orange: "bg-[#FD5E19] text-white hover:bg-[#FD5E19]/90 shadow-xl shadow-orange-600/20",
        navy: "bg-[#0A1128] text-white hover:bg-[#0A1128]/90 shadow-xl shadow-slate-900/20",
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
                "inline-flex items-center justify-center whitespace-nowrap font-black transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-50",
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
        default: "border-transparent bg-slate-100 text-slate-600",
        success: "bg-emerald-50 text-emerald-600 border border-emerald-200",
        warning: "bg-amber-50 text-amber-600 border border-amber-200",
        destructive: "bg-rose-50 text-rose-600 border border-rose-200",
        primary: "bg-blue-50 text-blue-600 border border-blue-200",
        orange: "bg-orange-50 text-orange-600 border border-orange-200",
        outline: "bg-transparent border border-slate-200 text-slate-500",
        secondary: "bg-slate-800 text-white border border-slate-700",
        navy: "bg-[#0A1128] text-white border-none",
    }

    return (
        <div className={cn("inline-flex items-center rounded-xl border px-3 py-1 text-[9px] font-black uppercase tracking-widest transition-all", badgeVariants[variant], className)}>
            {children}
        </div>
    )
}
