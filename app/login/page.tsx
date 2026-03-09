'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, SwissHeading } from '@/components/ui/SwissUI';
import { Logo } from '@/components/ui/Logo';
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound, Mail, Sparkles, ShieldCheck, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast.error("Required Fields", { description: "Please enter your email and password." });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Login failed");
            }

            const data = await response.json();
            toast.success("Welcome back", { description: "You have successfully signed in." });
            router.push(data.redirectUrl);
        } catch (error: any) {
            toast.error("Login Error", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-6 bg-slate-50/50 relative">
            <div className="w-full max-w-[420px] space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="relative w-16 h-16 overflow-hidden">
                        <Logo size="lg" showText={false} className="object-contain" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-2xl font-black tracking-tight text-slate-900">Welcome back</h1>
                        <p className="text-sm text-slate-500 font-medium">Enter your credentials to access your account</p>
                    </div>
                </div>

                <Card className="rounded-[28px] border border-slate-200/60 shadow-xl shadow-slate-200/50 bg-white">
                    <CardContent className="p-8 pb-10 space-y-6">
                        <form onSubmit={handleLogin} className="space-y-5">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1" htmlFor="email">
                                    Email Address
                                </label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="email"
                                        placeholder="yourname@university.edu"
                                        type="email"
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/20 font-bold"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex items-center justify-between ml-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400" htmlFor="password">
                                        Password
                                    </label>
                                    <button type="button" className="text-[10px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 transition-colors">
                                        Forgot?
                                    </button>
                                </div>
                                <div className="relative group">
                                    <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                                    <Input
                                        id="password"
                                        type="password"
                                        placeholder="••••••••"
                                        className="h-12 pl-12 rounded-xl bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-blue-600/20 font-bold"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <Button className="w-full h-12 mt-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[11px] group relative overflow-hidden shadow-lg shadow-blue-500/20" disabled={isLoading}>
                                {isLoading ? (
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                        <span>Signing in...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        Sign In <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </div>
                                )}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                <div className="text-center">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">
                        © 2026 University Planning System
                    </p>
                </div>
            </div>
        </div>
    );
}

import Link from 'next/link';
