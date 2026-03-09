'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Loader2, KeyRound, ShieldCheck } from 'lucide-react';
import { Logo } from '@/components/ui/Logo';

export default function ForceChangePasswordPage() {
    const router = useRouter();
    const [newPassword, setNewPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newPassword !== confirm) { toast.error('Passwords do not match'); return; }
        if (newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setLoading(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ newPassword, skipCurrentCheck: true }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            toast.success('Password updated! Welcome aboard.');
            // Redirect to their dashboard — middleware handles role-based redirect
            router.replace('/');
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || 'Failed to update password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
            <div className="w-full max-w-md space-y-6">
                <div className="text-center space-y-2">
                    <div className="flex justify-center mb-4"><Logo showText /></div>
                    <div className="flex items-center justify-center gap-2 text-amber-600 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
                        <ShieldCheck className="w-4 h-4" />
                        <p className="text-sm font-bold">Password change required</p>
                    </div>
                    <h1 className="text-2xl font-bold text-slate-900">Set your new password</h1>
                    <p className="text-slate-500 text-sm">Your account was provisioned with a temporary password. Please set a secure one before continuing.</p>
                </div>
                <Card className="shadow-lg border-slate-200">
                    <CardContent className="p-6">
                        <form onSubmit={handleSubmit} className="space-y-4">
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
                                {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <ShieldCheck className="w-4 h-4 mr-2" />}
                                Save & Continue
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
