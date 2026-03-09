'use client';

import React, { useState, useEffect } from 'react';
import { useParams, usePathname } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Mail, Phone, BookOpen, Users, CheckCircle2, XCircle, Clock, BarChart3, ChevronLeft, AlertTriangle, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

const MISSED_REASON_LABELS: Record<string, string> = {
    ON_LEAVE: 'On Leave',
    TOPIC_TOOK_LONGER: 'Topic Took Longer',
    HOLIDAY_CLASH: 'Holiday Clash',
    TECHNICAL_ISSUE: 'Technical Issue',
    LOW_ATTENDANCE: 'Low Attendance',
    OTHER: 'Other',
};

const UNDERPERFORM_THRESHOLD = 0.30; // 30% miss rate triggers warning

export default function FacultyDetailPage() {
    const params = useParams();
    const pathname = usePathname();
    const id = params.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const role = pathname.includes('/principal/') ? 'Principal' : 'HOD';

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`/api/admin/faculty/detail?id=${id}`);
                const json = await res.json();
                if (json.success) {
                    setData(json);
                } else {
                    toast.error(json.error || "Failed to load faculty details");
                }
            } catch (err) {
                toast.error("Error fetching data");
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) {
        return (
            <DashboardLayout role={role}>
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 opacity-50" />
                    <p className="mt-4 text-slate-500 font-bold uppercase tracking-widest text-xs animate-pulse">Loading faculty details...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return <DashboardLayout role={role}>User not found</DashboardLayout>;

    const { user, groups, topics, stats } = data;

    const totalMarked = stats.hits + stats.misses;
    const missRate = totalMarked > 0 ? stats.misses / totalMarked : 0;
    const isUnderperforming = missRate > UNDERPERFORM_THRESHOLD && totalMarked >= 5;

    const chartData = [
        { name: 'Completed', value: stats.hits, color: '#2563eb' },
        { name: 'Missed', value: stats.misses, color: '#ef4444' },
        { name: 'Pending', value: stats.pending, color: '#94a3b8' }
    ].filter(d => d.value > 0);

    // Group missed reasons for summary
    const missedTopics = topics.filter((t: any) => t.completion_status === 'MISSED');
    const reasonCounts: Record<string, number> = {};
    missedTopics.forEach((t: any) => {
        const key = t.missed_reason || 'UNSPECIFIED';
        reasonCounts[key] = (reasonCounts[key] || 0) + 1;
    });

    return (
        <DashboardLayout role={role}>
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="space-y-6">
                    <Link href={`/dashboard/${role.toLowerCase()}`} className="inline-flex items-center text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-blue-600 transition-colors">
                        <ChevronLeft className="w-4 h-4 mr-1" /> Back to Overview
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-center gap-6">
                        <div className="relative">
                            <div className="w-20 h-20 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-3xl font-bold shadow-lg shadow-blue-100 italic">
                                {user.name.charAt(0)}
                            </div>
                            {isUnderperforming && (
                                <div className="absolute -top-2 -right-2 w-6 h-6 bg-rose-500 rounded-full flex items-center justify-center shadow-md" title="Underperforming">
                                    <AlertTriangle className="w-3.5 h-3.5 text-white" />
                                </div>
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">{user.name}</h1>
                                {isUnderperforming && (
                                    <Badge className="bg-rose-100 text-rose-700 border border-rose-200 flex items-center gap-1.5 px-3 py-1 text-xs font-black">
                                        <TrendingDown className="w-3.5 h-3.5" />
                                        Underperforming · {Math.round(missRate * 100)}% miss rate
                                    </Badge>
                                )}
                            </div>
                            <div className="flex items-center gap-3 mt-1">
                                <Badge variant="secondary" className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                                    {user.facultyType === 'SENIOR' ? 'Senior Faculty' : 'Assistant Professor'}
                                </Badge>
                                <span className="text-slate-400 text-sm font-medium border-l pl-3 border-slate-100">
                                    {user.department || 'General Academics'}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Contact Info */}
                        <Card className="shadow-sm border-slate-200">
                            <CardHeader className="py-4 px-6 border-b bg-slate-50/50">
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <Users className="w-4 h-4" /> Contact Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Email Address</p>
                                    <p className="text-sm font-bold text-slate-900 truncate">{user.email}</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Phone Number</p>
                                    <p className="text-sm font-bold text-slate-900">{user.mobile || 'Not provided'}</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Stats */}
                        <Card className={cn("shadow-sm", isUnderperforming ? "border-rose-200" : "border-slate-200")}>
                            <CardHeader className={cn("py-4 px-6 border-b", isUnderperforming ? "bg-rose-50/50" : "bg-slate-50/50")}>
                                <CardTitle className="text-sm font-bold flex items-center gap-2">
                                    <BarChart3 className="w-4 h-4" /> Completion Status
                                </CardTitle>
                                {isUnderperforming && (
                                    <CardDescription className="text-rose-600 font-bold text-xs mt-1 flex items-center gap-1">
                                        <AlertTriangle className="w-3 h-3" />
                                        Miss rate exceeds {Math.round(UNDERPERFORM_THRESHOLD * 100)}% threshold
                                    </CardDescription>
                                )}
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="h-50 w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie data={chartData} cx="50%" cy="50%" innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-slate-400 text-xs font-medium italic">No data available</div>
                                    )}
                                </div>
                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100 text-center">
                                        <div className="text-2xl font-bold text-blue-700">{stats.hits}</div>
                                        <div className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">Completed</div>
                                    </div>
                                    <div className="bg-rose-50/50 p-4 rounded-2xl border border-rose-100 text-center">
                                        <div className="text-2xl font-bold text-rose-700">{stats.misses}</div>
                                        <div className="text-[10px] font-bold text-rose-600 uppercase tracking-wider">Missed</div>
                                    </div>
                                </div>

                                {/* Missed Reason Breakdown */}
                                {Object.keys(reasonCounts).length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Missed — Reason Breakdown</p>
                                        {Object.entries(reasonCounts).sort((a, b) => b[1] - a[1]).map(([key, count]) => (
                                            <div key={key} className="flex items-center justify-between text-xs">
                                                <span className="font-medium text-slate-600">{MISSED_REASON_LABELS[key] || key}</span>
                                                <Badge variant="outline" className="text-rose-600 border-rose-200 font-black text-[10px]">{count}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content: Course Timeline */}
                    <div className="lg:col-span-8">
                        <Card className="shadow-sm border-slate-200 h-full flex flex-col">
                            <CardHeader className="py-5 px-8 border-b bg-slate-50/50 flex flex-row items-center justify-between">
                                <CardTitle className="text-lg font-bold">Course Progress</CardTitle>
                                <Badge variant="outline" className="text-[10px] font-bold uppercase tracking-wider">
                                    {topics.length} Total Topics
                                </Badge>
                            </CardHeader>
                            <CardContent className="p-0 flex-1 overflow-auto max-h-150">
                                <table className="w-full text-left">
                                    <thead className="bg-slate-50 sticky top-0 z-10 border-b">
                                        <tr>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Topic</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center">Status</th>
                                            <th className="px-6 py-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Missed Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {topics.length > 0 ? topics.map((topic: any, i: number) => (
                                            <tr key={i} className={cn("hover:bg-slate-50/30 transition-colors", topic.completion_status === 'MISSED' && "bg-rose-50/20")}>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-bold text-slate-700 italic">
                                                        {topic.scheduled_date
                                                            ? new Date(topic.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                                                            : 'Pending'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-sm text-slate-900 uppercase tracking-tight">{topic.name}</div>
                                                    <div className="text-[10px] text-blue-600 font-bold uppercase tracking-wider mt-0.5">{topic.subject || '-'}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-slate-500 italic">{topic.groupName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {topic.completion_status === 'DONE' ? (
                                                        <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto ring-4 ring-blue-50/50">
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </div>
                                                    ) : topic.completion_status === 'MISSED' ? (
                                                        <div className="w-6 h-6 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto ring-4 ring-rose-50/50">
                                                            <XCircle className="w-4 h-4" />
                                                        </div>
                                                    ) : topic.completion_status === 'CONTINUED' ? (
                                                        <Badge className="bg-amber-50 text-amber-600 border-amber-200 text-[9px] font-black">Cont.</Badge>
                                                    ) : (
                                                        <div className="w-6 h-6 rounded-full border-2 border-slate-100 mx-auto" />
                                                    )}
                                                </td>
                                                <td className="px-6 py-4">
                                                    {topic.completion_status === 'MISSED' && topic.missed_reason ? (
                                                        <div className="space-y-0.5">
                                                            <span className="text-xs font-bold text-rose-600">
                                                                {MISSED_REASON_LABELS[topic.missed_reason] || topic.missed_reason}
                                                            </span>
                                                            {topic.missed_reason === 'OTHER' && topic.missed_reason_custom && (
                                                                <p className="text-[10px] text-slate-500 italic">"{topic.missed_reason_custom}"</p>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="text-[10px] text-slate-300">—</span>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={5} className="px-8 py-12 text-center text-slate-400 font-medium italic">
                                                    No topics assigned to this faculty.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
