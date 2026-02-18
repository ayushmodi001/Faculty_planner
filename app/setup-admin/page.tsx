'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, SwissHeading } from '@/components/ui/SwissUI';
import { Input } from "@/components/ui/input"
import { Loader2, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminSetupPage() {
    const router = useRouter();
    const [key, setKey] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSignup = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    email,
                    password,
                    name,
                    role: 'PRINCIPAL', // Creating a Principal/Admin account
                    secretKey: key
                }),
            });

            if (!response.ok) {
                const error = await response.json();
                if (response.status === 403) {
                    throw new Error("Invalid Setup Key. Access Denied.");
                }
                throw new Error(error.error || "Setup failed");
            }

            toast.success("Admin Account Created", { description: "Redirecting to login..." });
            // Small delay to let the toast appear
            await new Promise(resolve => setTimeout(resolve, 1500));
            router.push('/login');

        } catch (error: any) {
            toast.error("Setup Failed", { description: error.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-950 text-slate-50">
            <Card className="w-full max-w-md border-red-900 bg-slate-900 text-slate-50">
                <CardHeader className="space-y-1 text-center border-b border-red-900/50 pb-8">
                    <div className="mx-auto w-12 h-12 bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                        <ShieldAlert className="w-6 h-6 text-red-500" />
                    </div>
                    <SwissHeading className="text-xl text-red-500">Restricted Access</SwissHeading>
                    <CardDescription className="text-slate-400">
                        Top Secret: Institute Initial Configuration.
                    </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 space-y-4">
                    <form onSubmit={handleSignup} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-bold uppercase tracking-wider text-red-500">
                                Setup Key
                            </label>
                            <Input
                                type="password"
                                className="bg-slate-950 border-red-900/50 text-white placeholder:text-slate-700"
                                placeholder="ENTER_SETUP_KEY"
                                value={key}
                                onChange={(e) => setKey(e.target.value)}
                            />
                        </div>

                        <div className="h-px bg-red-900/30 w-full my-4"></div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Institute Name</label>
                            <Input className="bg-slate-950 border-slate-800 text-white" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Admin Email</label>
                            <Input className="bg-slate-950 border-slate-800 text-white" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Secure Password</label>
                            <Input type="password" className="bg-slate-950 border-slate-800 text-white" value={password} onChange={(e) => setPassword(e.target.value)} />
                        </div>

                        <Button className="w-full mt-6 bg-red-600 hover:bg-red-700 text-white" disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin w-4 h-4" /> : "Initialize System"}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
