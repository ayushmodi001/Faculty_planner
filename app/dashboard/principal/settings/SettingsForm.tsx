'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@/components/ui/SwissUI';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

export default function SettingsForm() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        collegeStartTime: "09:00",
        collegeEndTime: "16:00",
        slotDurationHours: 1
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    setFormData({
                        collegeStartTime: data.settings.collegeStartTime || "09:00",
                        collegeEndTime: data.settings.collegeEndTime || "16:00",
                        slotDurationHours: data.settings.slotDurationHours || 1
                    });
                }
            } catch (err) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Settings updated successfully');
            } else {
                toast.error(data.error || 'Failed to update settings');
            }
        } catch (err) {
            toast.error('Failed to update settings');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>;
    }

    return (
        <Card className="border shadow-lg">
            <CardContent className="pt-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">College Start Time</label>
                        <input
                            type="time"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.collegeStartTime}
                            onChange={(e) => setFormData({ ...formData, collegeStartTime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">College End Time</label>
                        <input
                            type="time"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.collegeEndTime}
                            onChange={(e) => setFormData({ ...formData, collegeEndTime: e.target.value })}
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium uppercase tracking-wider">Slot Duration (Hours)</label>
                        <input
                            type="number"
                            min="1"
                            max="4"
                            className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                            value={formData.slotDurationHours}
                            onChange={(e) => setFormData({ ...formData, slotDurationHours: Number(e.target.value) })}
                            required
                        />
                    </div>

                    <Button type="submit" disabled={saving} className="w-full">
                        {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                        Save Settings
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
