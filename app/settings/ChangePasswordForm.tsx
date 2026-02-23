'use client';

import React, { useState } from 'react';
import { Card, CardContent, Button } from '@/components/ui/SwissUI';
import { toast } from 'sonner';
import { Loader2, KeyRound } from 'lucide-react';

export default function ChangePasswordForm() {
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            toast.error("New passwords do not match.");
            return;
        }

        setSaving(true);
        try {
            const res = await fetch('/api/user/password', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: formData.currentPassword, newPassword: formData.newPassword })
            });
            const data = await res.json();

            if (res.ok && data.success) {
                toast.success('Password updated successfully');
                setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(data.error || 'Failed to update password');
            }
        } catch (err) {
            toast.error('Failed to update password');
        } finally {
            setSaving(false);
        }
    };

    return (
        <Card className="border shadow-lg">
            <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-4 border-b pb-2">Change Password</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">Current Password</label>
                        <input
                            type="password"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.currentPassword}
                            onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">New Password</label>
                        <input
                            type="password"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.newPassword}
                            onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">Confirm New Password</label>
                        <input
                            type="password"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <KeyRound className="w-4 h-4 mr-2" />}
                        Update Password
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
