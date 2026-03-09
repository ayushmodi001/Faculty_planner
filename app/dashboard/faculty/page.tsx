'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    MapPin,
    Loader2,
    BookOpen,
    AlertCircle,
    Calendar,
    Clock,
    Sparkles,
    ChevronRight,
    CheckCircle2,
    CalendarDays,
    XCircle,
    RefreshCw,
    ChevronDown,
    Send,
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type MissedReason = 'ON_LEAVE' | 'TOPIC_TOOK_LONGER' | 'HOLIDAY_CLASH' | 'TECHNICAL_ISSUE' | 'LOW_ATTENDANCE' | 'OTHER';
type CompletionStatus = 'PENDING' | 'DONE' | 'MISSED' | 'CONTINUED';

const MISSED_REASON_LABELS: Record<MissedReason, string> = {
    ON_LEAVE: 'Faculty on Leave',
    TOPIC_TOOK_LONGER: 'Topic Took Longer',
    HOLIDAY_CLASH: 'Holiday / Event Clash',
    TECHNICAL_ISSUE: 'Technical Issue',
    LOW_ATTENDANCE: 'Low Student Attendance',
    OTHER: 'Other (specify)',
};

interface ILectureSlot {
    id: string;
    startTime: string;
    endTime: string;
    formattedTime: string;
    subject: string;
    groupName: string;
    room: string;
    topic: string;
    isPlanActive: boolean;
    planId?: string;
    topicId?: string;
    completion_status: CompletionStatus;
    missed_reason?: MissedReason;
    missed_reason_custom?: string;
    marked_at?: string;
}

interface IDashboardData {
    facultyName: string;
    date: string;
    schedule: ILectureSlot[];
}

/* ------------------------------------------------------------------ */
/*  Per-slot action panel                                               */
/* ------------------------------------------------------------------ */
function TopicActions({ slot, onUpdate }: { slot: ILectureSlot; onUpdate: (id: string, patch: Partial<ILectureSlot>) => void }) {
    const [open, setOpen] = useState(false);
    const [pendingStatus, setPendingStatus] = useState<CompletionStatus | null>(null);
    const [reason, setReason] = useState<MissedReason | ''>('');
    const [customReason, setCustomReason] = useState('');
    const [submitting, setSubmitting] = useState(false);

    if (!slot.planId || !slot.topicId) return null;

    const alreadyMarked = slot.completion_status !== 'PENDING';
    const status = slot.completion_status;

    const handleAction = async (s: CompletionStatus) => {
        if (s === 'MISSED') {
            setPendingStatus('MISSED');
            setOpen(true);
            return;
        }
        await submit(s);
    };

    const submit = async (s: CompletionStatus, r?: MissedReason | '', custom?: string) => {
        if (!slot.planId || !slot.topicId) return;
        setSubmitting(true);
        try {
            const body: any = {
                planId: slot.planId,
                topicId: slot.topicId,
                status: s,
                marked_at: new Date().toISOString(),
            };
            if (s === 'MISSED' && r) {
                body.missed_reason = r;
                if (r === 'OTHER') body.missed_reason_custom = custom;
            }
            const res = await fetch('/api/faculty/dashboard/topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            if (!res.ok) throw new Error((await res.json()).error || 'Failed');
            toast.success(s === 'DONE' ? 'Topic marked as done!' : s === 'MISSED' ? 'Topic marked as missed.' : 'Topic continued — schedule updated.');
            onUpdate(slot.id, {
                completion_status: s,
                missed_reason: s === 'MISSED' ? (r as MissedReason) : undefined,
                missed_reason_custom: s === 'MISSED' && r === 'OTHER' ? custom : undefined,
                marked_at: new Date().toISOString(),
            });
            setOpen(false);
        } catch (e: any) {
            toast.error(e.message);
        } finally {
            setSubmitting(false);
        }
    };

    const statusConfig: Record<CompletionStatus, { label: string; color: string; icon: React.ReactNode }> = {
        DONE: { label: 'Done', color: 'text-emerald-600 bg-emerald-50 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
        MISSED: { label: 'Missed', color: 'text-rose-600 bg-rose-50 border-rose-200', icon: <XCircle className="w-3.5 h-3.5" /> },
        CONTINUED: { label: 'Continued', color: 'text-amber-600 bg-amber-50 border-amber-200', icon: <RefreshCw className="w-3.5 h-3.5" /> },
        PENDING: { label: 'Pending', color: 'text-slate-500 bg-slate-50 border-slate-200', icon: <Clock className="w-3.5 h-3.5" /> },
    };

    return (
        <div className="mt-4 space-y-3">
            {alreadyMarked ? (
                <div className="flex items-center gap-2">
                    <Badge className={cn('flex items-center gap-1.5 px-3 py-1 text-[11px] font-bold border', statusConfig[status].color)}>
                        {statusConfig[status].icon}
                        {statusConfig[status].label}
                    </Badge>
                    {status === 'MISSED' && slot.missed_reason && (
                        <span className="text-[11px] text-slate-500 font-medium">
                            — {MISSED_REASON_LABELS[slot.missed_reason]}
                            {slot.missed_reason === 'OTHER' && slot.missed_reason_custom && `: "${slot.missed_reason_custom}"`}
                        </span>
                    )}
                </div>
            ) : (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mr-1">Mark as:</span>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('DONE')}
                        disabled={submitting}
                        className="h-7 px-3 text-[11px] font-black uppercase tracking-wide border-emerald-200 text-emerald-700 hover:bg-emerald-50 hover:border-emerald-300"
                    >
                        <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Done
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('MISSED')}
                        disabled={submitting}
                        className="h-7 px-3 text-[11px] font-black uppercase tracking-wide border-rose-200 text-rose-700 hover:bg-rose-50 hover:border-rose-300"
                    >
                        <XCircle className="w-3.5 h-3.5 mr-1" /> Missed
                    </Button>
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleAction('CONTINUED')}
                        disabled={submitting}
                        className="h-7 px-3 text-[11px] font-black uppercase tracking-wide border-amber-200 text-amber-700 hover:bg-amber-50 hover:border-amber-300"
                    >
                        <RefreshCw className="w-3.5 h-3.5 mr-1" /> Continued
                    </Button>
                    {submitting && <Loader2 className="w-4 h-4 animate-spin text-slate-400" />}
                </div>
            )}

            {/* Missed Reason Panel */}
            {open && pendingStatus === 'MISSED' && (
                <div className="bg-rose-50/60 border border-rose-200 rounded-2xl p-4 space-y-3 animate-in fade-in slide-in-from-top-2 duration-200">
                    <p className="text-[11px] font-black text-rose-700 uppercase tracking-widest">Reason for missing this class</p>
                    <div className="relative">
                        <select
                            className="w-full appearance-none bg-white border border-rose-200 rounded-xl px-3 py-2 pr-8 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300"
                            value={reason}
                            onChange={e => setReason(e.target.value as MissedReason)}
                        >
                            <option value="">Select a reason…</option>
                            {(Object.keys(MISSED_REASON_LABELS) as MissedReason[]).map(k => (
                                <option key={k} value={k}>{MISSED_REASON_LABELS[k]}</option>
                            ))}
                        </select>
                        <ChevronDown className="w-4 h-4 text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                    {reason === 'OTHER' && (
                        <input
                            type="text"
                            placeholder="Describe the reason…"
                            value={customReason}
                            onChange={e => setCustomReason(e.target.value)}
                            className="w-full bg-white border border-rose-200 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-rose-300 placeholder:text-slate-400"
                        />
                    )}
                    <div className="flex items-center gap-2">
                        <Button
                            size="sm"
                            onClick={() => submit('MISSED', reason as MissedReason, customReason)}
                            disabled={submitting || !reason || (reason === 'OTHER' && !customReason.trim())}
                            className="h-7 px-4 text-[11px] font-black uppercase tracking-wide bg-rose-600 hover:bg-rose-700 text-white"
                        >
                            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <><Send className="w-3 h-3 mr-1" />Submit</>}
                        </Button>
                        <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => { setOpen(false); setPendingStatus(null); setReason(''); setCustomReason(''); }}
                            disabled={submitting}
                            className="h-7 px-3 text-[11px] font-black uppercase tracking-wide text-slate-500"
                        >
                            Cancel
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}

/* ------------------------------------------------------------------ */
/*  Main page                                                           */
/* ------------------------------------------------------------------ */
export default function FacultyDashboard() {
    const [data, setData] = useState<IDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/faculty/dashboard');
                if (!res.ok) throw new Error("Failed to load dashboard data");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                toast.error("Failed to sync schedule");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSlotUpdate = useCallback((slotId: string, patch: Partial<ILectureSlot>) => {
        setData(prev => {
            if (!prev) return prev;
            return {
                ...prev,
                schedule: prev.schedule.map(s => s.id === slotId ? { ...s, ...patch } : s),
            };
        });
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Faculty">
                <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
                    <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                    <p className="text-sm font-medium text-slate-500">Loading your schedule...</p>
                </div>
            </DashboardLayout>
        );
    }

    const lectures = data?.schedule || [];

    return (
        <DashboardLayout role="Faculty">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            Welcome, {data?.facultyName}
                        </h1>
                        <p className="text-slate-500 text-sm mt-1">
                            You have <span className="font-bold text-blue-600">{lectures.length} classes</span> scheduled for <span className="font-bold text-slate-900">{data?.date}</span>.
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Classes Timeline */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="flex items-center gap-2 px-1">
                            <h3 className="text-lg font-bold text-slate-900">Today&apos;s Schedule</h3>
                        </div>

                        {lectures.length === 0 ? (
                            <Card className="border-dashed py-16 text-center">
                                <CardContent className="space-y-3">
                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto">
                                        <CalendarDays className="w-6 h-6 text-slate-300" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-bold text-slate-900 text-lg">No classes today</p>
                                        <p className="text-slate-500 text-sm">Enjoy your day off or use the time for planning.</p>
                                    </div>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-4">
                                {lectures.map((lecture, idx) => {
                                    const isActive = idx === 0;
                                    const statusColors: Record<CompletionStatus, string> = {
                                        DONE: 'border-l-emerald-400',
                                        MISSED: 'border-l-rose-400',
                                        CONTINUED: 'border-l-amber-400',
                                        PENDING: 'border-l-transparent',
                                    };
                                    return (
                                        <Card
                                            key={lecture.id}
                                            className={cn(
                                                "overflow-hidden border border-border/60 group rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 border-l-4",
                                                statusColors[lecture.completion_status],
                                                isActive && lecture.completion_status === 'PENDING' && "ring-2 ring-primary ring-offset-2"
                                            )}
                                        >
                                            <div className="flex flex-col sm:flex-row">
                                                <div className={cn(
                                                    "sm:w-32 flex flex-col items-center justify-center p-4 border-b sm:border-b-0 sm:border-r",
                                                    isActive && lecture.completion_status === 'PENDING'
                                                        ? "bg-primary text-primary-foreground"
                                                        : "bg-muted/50 text-muted-foreground"
                                                )}>
                                                    <Clock className="w-5 h-5 mb-2 opacity-70" />
                                                    <p className="text-sm font-black tracking-tight leading-none">{lecture.startTime}</p>
                                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mt-1">{lecture.endTime}</p>
                                                </div>
                                                <div className="flex-1 p-6">
                                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-3">
                                                                <h4 className="text-xl font-black text-foreground tracking-tight">{lecture.subject}</h4>
                                                                {isActive && lecture.completion_status === 'PENDING' && (
                                                                    <Badge className="bg-primary/10 text-primary border-0 h-6 px-2.5 text-[10px] uppercase font-black tracking-widest">Active Session</Badge>
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-black uppercase tracking-widest opacity-70">
                                                                <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {lecture.room}</span>
                                                                <span className="flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" /> {lecture.groupName}</span>
                                                            </div>
                                                        </div>
                                                        <Button variant="outline" size="sm" asChild className="text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                            <Link href="/dashboard/faculty/planner">Syllabus Guide</Link>
                                                        </Button>
                                                    </div>

                                                    <div className="p-4 bg-muted/30 rounded-2xl border border-border/40 flex items-start gap-3 group-hover:bg-muted/50 transition-colors">
                                                        <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                                        <div className="space-y-1 flex-1">
                                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Scheduled Topic</p>
                                                            <p className="text-sm font-medium text-slate-700 leading-snug">{lecture.topic}</p>
                                                        </div>
                                                    </div>

                                                    {lecture.isPlanActive && (
                                                        <TopicActions slot={lecture} onUpdate={handleSlotUpdate} />
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Quick Actions */}
                    <div className="lg:col-span-4 space-y-4">
                        <h3 className="text-lg font-bold text-slate-900 px-1">Quick Actions</h3>

                        <div className="grid grid-cols-1 gap-3">
                            <QuickActionCard
                                href="/dashboard/faculty/calendar"
                                icon={Calendar}
                                title="My Calendar"
                                description="Check upcoming classes"
                                color="text-blue-600"
                                bgColor="bg-blue-50"
                            />
                            <QuickActionCard
                                href="/dashboard/faculty/planner"
                                icon={BookOpen}
                                title="Syllabus Tracker"
                                description="Track course completion"
                                color="text-emerald-600"
                                bgColor="bg-emerald-50"
                            />
                            <QuickActionCard
                                href="/settings"
                                icon={AlertCircle}
                                title="Report Conflict"
                                description="Notify manual scheduling errors"
                                color="text-rose-600"
                                bgColor="bg-rose-50"
                            />
                        </div>

                        <Card className="bg-slate-900 text-white overflow-hidden relative border-none">
                            <CardContent className="p-6">
                                <h4 className="font-bold flex items-center gap-2 mb-2">
                                    <Sparkles className="w-4 h-4 text-emerald-400" />
                                    Planner Note
                                </h4>
                                <p className="text-xs text-slate-300 leading-relaxed font-medium">
                                    Your teaching schedule is auto-generated based on the academic calendar. Contact your HOD if you need any adjustments.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

function QuickActionCard({ href, icon: Icon, title, description, color, bgColor }: any) {
    return (
        <Link href={href}>
            <Card className="hover:border-slate-300 transition-all group shadow-sm hover:shadow-md">
                <CardContent className="p-5 flex items-center gap-4">
                    <div className={cn("w-10 h-10 rounded-lg flex items-center justify-center shrink-0", bgColor, color)}>
                        <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-slate-900 leading-tight uppercase tracking-tight">{title}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5 truncate font-medium">{description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-300 font-bold group-hover:translate-x-0.5 transition-all" />
                </CardContent>
            </Card>
        </Link>
    );
}
