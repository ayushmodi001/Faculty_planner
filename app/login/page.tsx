'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, SwissHeading } from '@/components/ui/SwissUI';
import { Logo } from '@/components/ui/Logo';
import { Input } from "@/components/ui/input"
import { Loader2, KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast.error("Missing Credentials", { description: "Please enter both email and password." });
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
            toast.success("Login Successful", { description: "Redirecting to dashboard..." });

            // Redirect based on role
            router.push(data.redirectUrl);

        } catch (error: any) {
            toast.error("Authentication Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
            {/* Background branding element */}
            <div className="absolute top-8 left-8">
                <Logo size="lg" />
            </div>

            <Card className="w-full max-w-md shadow-2xl border-primary/10">
                <CardHeader className="space-y-1 items-center text-center pb-8 border-b bg-slate-50/50">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                        <KeyRound className="w-8 h-8 text-primary" />
                    </div>
                    <SwissHeading className="text-2xl">Welcome Back</SwissHeading>
                    <CardDescription>
                        Enter your credentials to access the secure portal.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8">
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="email">
                                University ID / Email
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    placeholder="admin@university.edu"
                                    type="email"
                                    className="pl-9"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none" htmlFor="password">
                                Password
                            </label>
                            <Input
                                id="password"
                                type="password"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                disabled={isLoading}
                            />
                        </div>
                        <Button className="w-full mt-6" size="lg" disabled={isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-xs text-muted-foreground">
                        Forgot password? Contact your Department Head.
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
