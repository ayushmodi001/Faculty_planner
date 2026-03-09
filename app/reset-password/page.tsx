'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, KeyRound, Mail, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

function ResetPasswordInner() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const prefillEmail = searchParams.get('email') || '';

    const [step, setStep] = useState<'request' | 'verify'>(prefillEmail ? 'verify' : 'request');
    const [email, setEmail] = useState(prefillEmail);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleRequest = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/auth/request-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email }),
            });
            await res.json();
            toast.success('If that email exists, a reset code has been sent.');
            setStep('verify');
        } catch {
            toast.error('Failed to send reset email. Try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-reset', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, otp, newPassword }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Password reset! Please log in.');
            router.push('/login');
        } catch (err: any) {
            toast.error(err.message || 'Reset failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4"><Logo showText /></div>
                    <h1 className="text-2xl font-bold text-slate-900">Reset your password</h1>
                    <p className="text-slate-500 text-sm">
                        {step === 'request'
                            ? 'Enter your institutional email to receive a reset code.'
                            : 'Enter the 6-digit code sent to your email.'}
                    </p>
                </div>

                <Card className="shadow-lg border-slate-200">
                    <CardContent className="p-6">
                        {step === 'request' ? (
                            <form onSubmit={handleRequest} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email Address</label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input type="email" className="pl-10" placeholder="you@university.edu" value={email} onChange={e => setEmail(e.target.value)} required />
                                    </div>
                                </div>
                                <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <Mail className="w-4 h-4 mr-2" />}
                                    Send Reset Code
                                </Button>
                                <Button type="button" variant="ghost" className="w-full text-sm text-slate-500" onClick={() => router.push('/login')}>
                                    Back to Login
                                </Button>
                            </form>
                        ) : (
                            <form onSubmit={handleVerify} className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Email</label>
                                    <Input type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">6-Digit Code</label>
                                    <div className="relative">
                                        <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input className="pl-10 font-mono text-center text-xl tracking-widest" placeholder="123456" maxLength={6} value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))} required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">New Password</label>
                                    <div className="relative">
                                        <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input type="password" className="pl-10" placeholder="Min. 6 characters" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest">Confirm Password</label>
                                    <Input type="password" placeholder="Repeat new password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
                                </div>
                                <Button type="submit" className="w-full h-11 font-bold" disabled={loading}>
                                    {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <KeyRound className="w-4 h-4 mr-2" />}
                                    Reset Password
                                </Button>
                                <Button type="button" variant="ghost" className="w-full text-sm text-slate-500" onClick={() => setStep('request')}>
                                    ← Resend Code
                                </Button>
                            </form>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense>
            <ResetPasswordInner />
        </Suspense>
    );
}
