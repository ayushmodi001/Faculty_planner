'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button } from '@/components/ui/SwissUI';
import { toast } from 'sonner';
import { Loader2, Save, Lock, Building2, Clock, ShieldCheck, Mail, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

type SettingsTab = 'INSTITUTION' | 'TIMINGS' | 'SECURITY';

export default function SettingsForm() {
    const [activeTab, setActiveTab] = useState<SettingsTab>('INSTITUTION');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);    const [formData, setFormData] = useState({
        collegeStartTime: "09:00",
        collegeEndTime: "16:00",
        slotDurationHours: 1,
        labDurationHours: 2,
        breakStartTime: "13:00",
        breakDurationHours: 1,
        institutionName: "",
        institutionShortName: "",
        contactEmail: "",
        address: ""
    });
    const [allowedDomains, setAllowedDomains] = useState<string[]>([]);
    const [newDomain, setNewDomain] = useState('');

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
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
                        slotDurationHours: data.settings.slotDurationHours || 1,
                        labDurationHours: data.settings.labDurationHours || 2,
                        breakStartTime: data.settings.breakStartTime || "13:00",
                        breakDurationHours: data.settings.breakDurationHours || 1,                        institutionName: data.settings.institutionName || "University Academic Planning System",
                        institutionShortName: data.settings.institutionShortName || "UAPS",
                        contactEmail: data.settings.contactEmail || "",
                        address: data.settings.address || ""
                    });
                    setAllowedDomains(data.settings.allowedEmailDomains || []);
                }
            } catch (err) {
                toast.error("Failed to load settings");
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSettingsSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, allowedEmailDomains: allowedDomains })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Configuration synchronized successfully');
            } else {
                toast.error(data.error || 'Sync failed');
            }
        } catch (err) {
            toast.error('Network synchronization error');
        } finally {
            setSaving(false);
        }
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setSaving(true);
        try {
            const res = await fetch('/api/auth/change-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(passwordData)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Security signature updated');
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" });
            } else {
                toast.error(data.error || 'Security update failed');
            }
        } catch (err) {
            toast.error('Network security error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-20 space-y-4">
                <Loader2 className="w-10 h-10 animate-spin text-primary opacity-20" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Retrieving Core Config</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Tab Navigation */}
            <div className="flex p-1.5 bg-slate-100 rounded-2xl gap-1">
                <TabButton
                    active={activeTab === 'INSTITUTION'}
                    onClick={() => setActiveTab('INSTITUTION')}
                    icon={Building2}
                    label="Identity"
                />
                <TabButton
                    active={activeTab === 'TIMINGS'}
                    onClick={() => setActiveTab('TIMINGS')}
                    icon={Clock}
                    label="Scheduling"
                />
                <TabButton
                    active={activeTab === 'SECURITY'}
                    onClick={() => setActiveTab('SECURITY')}
                    icon={ShieldCheck}
                    label="Security"
                />
            </div>

            <Card className="border shadow-2xl overflow-hidden rounded-[32px]">
                <CardContent className="p-8">
                    {activeTab === 'INSTITUTION' && (
                        <form onSubmit={handleSettingsSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <SectionHeading title="Institution Identity" description="Core branding and institutional identifiers." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputWrapper label="Institution Name">
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.institutionName}
                                            onChange={(e) => setFormData({ ...formData, institutionName: e.target.value })}
                                            placeholder="Full University Name"
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Short Identifier (Slug)">
                                        <input
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all uppercase"
                                            value={formData.institutionShortName}
                                            onChange={(e) => setFormData({ ...formData, institutionShortName: e.target.value })}
                                            placeholder="UAPS"
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Official Contact Email">
                                        <div className="relative">
                                            <input
                                                type="email"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={formData.contactEmail}
                                                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                                                placeholder="admin@institution.edu"
                                            />
                                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </InputWrapper>                                    <InputWrapper label="Physical Address">
                                        <div className="relative">
                                            <input
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={formData.address}
                                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                                placeholder="Campus Details"
                                            />
                                            <MapPin className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </InputWrapper>

                                    {/* Allowed Email Domains */}
                                    <div className="space-y-2 md:col-span-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest block">Allowed Email Domains</label>
                                        <p className="text-xs text-slate-400 mb-2">Only these domains can be used when inviting new users. Leave empty to allow any domain.</p>
                                        <div className="flex gap-2">
                                            <input
                                                className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-mono focus:ring-2 focus:ring-primary/20 outline-none"
                                                placeholder="e.g. university.edu"
                                                value={newDomain}
                                                onChange={(e) => setNewDomain(e.target.value.toLowerCase().trim())}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault();
                                                        if (newDomain && !allowedDomains.includes(newDomain)) {
                                                            setAllowedDomains(prev => [...prev, newDomain]);
                                                            setNewDomain('');
                                                        }
                                                    }
                                                }}
                                            />
                                            <button type="button" onClick={() => {
                                                if (newDomain && !allowedDomains.includes(newDomain)) {
                                                    setAllowedDomains(prev => [...prev, newDomain]);
                                                    setNewDomain('');
                                                }
                                            }} className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-colors">
                                                Add
                                            </button>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mt-2">
                                            {allowedDomains.length === 0 && (
                                                <span className="text-xs text-slate-400 italic">No domain restrictions (any email allowed)</span>
                                            )}
                                            {allowedDomains.map((d) => (
                                                <span key={d} className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                                                    @{d}
                                                    <button type="button" onClick={() => setAllowedDomains(prev => prev.filter(x => x !== d))} className="hover:text-red-600">×</button>
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full h-14 rounded-2xl font-black text-xs tracking-widest uppercase">
                                {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                                Synchronize Identity
                            </Button>
                        </form>
                    )}

                    {activeTab === 'TIMINGS' && (
                        <form onSubmit={handleSettingsSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <SectionHeading title="College Scheduling" description="Global timing constraints for the planning engine." />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputWrapper label="Operation Start">
                                        <input
                                            type="time"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                                            value={formData.collegeStartTime}
                                            onChange={(e) => setFormData({ ...formData, collegeStartTime: e.target.value })}
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Operation End">
                                        <input
                                            type="time"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                                            value={formData.collegeEndTime}
                                            onChange={(e) => setFormData({ ...formData, collegeEndTime: e.target.value })}
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Standard Lecture (Hrs)">
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.slotDurationHours}
                                            onChange={(e) => setFormData({ ...formData, slotDurationHours: Number(e.target.value) })}
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Laboratory Duration (Hrs)">
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.labDurationHours}
                                            onChange={(e) => setFormData({ ...formData, labDurationHours: Number(e.target.value) })}
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Recess Start">
                                        <input
                                            type="time"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all font-mono"
                                            value={formData.breakStartTime}
                                            onChange={(e) => setFormData({ ...formData, breakStartTime: e.target.value })}
                                        />
                                    </InputWrapper>
                                    <InputWrapper label="Recess Duration (Hrs)">
                                        <input
                                            type="number"
                                            step="0.5"
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                            value={formData.breakDurationHours}
                                            onChange={(e) => setFormData({ ...formData, breakDurationHours: Number(e.target.value) })}
                                        />
                                    </InputWrapper>
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full h-14 rounded-2xl font-black text-xs tracking-widest uppercase">
                                {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <Save className="w-5 h-5 mr-3" />}
                                Commit Timing Cycles
                            </Button>
                        </form>
                    )}

                    {activeTab === 'SECURITY' && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-8">
                            <div className="space-y-6">
                                <SectionHeading title="Access & Security" description="Update administrative credentials and access tokens." />
                                <div className="space-y-4">
                                    <InputWrapper label="Current Administrative Password">
                                        <div className="relative">
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 pl-10 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={passwordData.currentPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                placeholder="••••••••••••"
                                            />
                                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </InputWrapper>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <InputWrapper label="New Security Signature">
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={passwordData.newPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                placeholder="Enter new signature"
                                            />
                                        </InputWrapper>
                                        <InputWrapper label="Confirm New Signature">
                                            <input
                                                type="password"
                                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-primary/20 outline-none transition-all"
                                                value={passwordData.confirmPassword}
                                                onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                placeholder="Repeat signature"
                                            />
                                        </InputWrapper>
                                    </div>
                                </div>
                            </div>
                            <Button type="submit" disabled={saving} className="w-full h-14 rounded-2xl font-black text-xs tracking-widest uppercase bg-navy">
                                {saving ? <Loader2 className="w-5 h-5 mr-3 animate-spin" /> : <ShieldCheck className="w-5 h-5 mr-3" />}
                                Re-sign Credentials
                            </Button>
                        </form>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean, onClick: () => void, icon: any, label: string }) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-300",
                active
                    ? "bg-white text-primary shadow-sm"
                    : "text-slate-400 hover:text-slate-600 hover:bg-slate-200/50"
            )}
        >
            <Icon className={cn("w-3.5 h-3.5", active ? "text-primary transition-transform scale-110" : "text-slate-400")} />
            {label}
        </button>
    );
}

function SectionHeading({ title, description }: { title: string, description: string }) {
    return (
        <div className="space-y-1 border-b border-slate-100 pb-4">
            <h4 className="text-lg font-black tracking-tight text-[#0A1128] uppercase">{title}</h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{description}</p>
        </div>
    );
}

function InputWrapper({ label, children }: { label: string, children: React.ReactNode }) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
            {children}
        </div>
    );
}
