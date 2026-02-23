'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Badge, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, Mail, Phone, BookOpen, Users, CheckCircle2, XCircle, Clock, BarChart3, ChevronLeft } from 'lucide-react';
import Link from 'next/link';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { toast } from 'sonner';

export default function FacultyDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

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
            <DashboardLayout role="HOD">
                <div className="flex flex-col items-center justify-center min-h-[60vh]">
                    <Loader2 className="w-12 h-12 animate-spin text-primary opacity-50" />
                    <p className="mt-4 text-muted-foreground font-medium animate-pulse">Gathering faculty performance data...</p>
                </div>
            </DashboardLayout>
        );
    }

    if (!data) return <DashboardLayout role="HOD">User not found</DashboardLayout>;

    const { user, groups, topics, stats } = data;

    const chartData = [
        { name: 'Completed (Hits)', value: stats.hits, color: '#22c55e' },
        { name: 'Missed', value: stats.misses, color: '#ef4444' },
        { name: 'Pending', value: stats.pending, color: '#94a3b8' }
    ].filter(d => d.value > 0);

    return (
        <DashboardLayout role="HOD">
            <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-700">
                {/* Header with Back Button */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b pb-6">
                    <div className="space-y-1">
                        <Link href="/dashboard/hod" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors mb-4">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Back to Roster
                        </Link>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-3xl bg-primary text-primary-foreground flex items-center justify-center text-2xl font-black shadow-lg">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <SwissHeading className="text-3xl">{user.name}</SwissHeading>
                                <div className="flex items-center gap-3 mt-1">
                                    <Badge variant="secondary" className="bg-primary/10 text-primary font-bold">
                                        {user.facultyType === 'SENIOR' ? 'Senior Faculty' : 'Assistant Professor'}
                                    </Badge>
                                    <span className="text-muted-foreground text-sm font-medium border-l pl-3 border-border">
                                        {user.department || 'General Academics'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Info & Groups */}
                    <div className="space-y-8">
                        {/* Contact Card */}
                        <Card className="border-none shadow-sm bg-muted/30">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Users className="w-5 h-5 text-muted-foreground" />
                                    Contact Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-lg border">
                                        <Mail className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm font-medium truncate">{user.email}</div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-background rounded-lg border">
                                        <Phone className="w-4 h-4" />
                                    </div>
                                    <div className="text-sm font-medium">{user.mobile || 'Not provided'}</div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Assigned Groups Card */}
                        <Card className="border-none shadow-sm bg-card overflow-hidden">
                            <div className="h-2 bg-primary"></div>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-muted-foreground" />
                                    Faculty Groups
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-wrap gap-2">
                                    {groups.length > 0 ? groups.map((g: any) => (
                                        <Badge key={g._id} variant="outline" className="px-3 py-1 bg-background">
                                            {g.name}
                                        </Badge>
                                    )) : (
                                        <p className="text-sm text-muted-foreground italic">No groups assigned.</p>
                                    )}
                                </div>
                            </CardContent>
                        </Card>

                        {/* Performance Chart */}
                        <Card className="border-none shadow-sm bg-card relative overflow-hidden">
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-muted-foreground" />
                                    Hits & Misses
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="h-[250px] w-full">
                                    {chartData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <PieChart>
                                                <Pie
                                                    data={chartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    innerRadius={60}
                                                    outerRadius={80}
                                                    paddingAngle={5}
                                                    dataKey="value"
                                                >
                                                    {chartData.map((entry, index) => (
                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                    ))}
                                                </Pie>
                                                <Tooltip />
                                                <Legend verticalAlign="bottom" height={36} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="h-full flex items-center justify-center text-muted-foreground text-sm italic">
                                            No tracking data available yet.
                                        </div>
                                    )}
                                </div>
                                <div className="mt-4 grid grid-cols-2 gap-4">
                                    <div className="bg-green-50 p-3 rounded-xl border border-green-100 text-center">
                                        <div className="text-2xl font-black text-green-700">{stats.hits}</div>
                                        <div className="text-[10px] font-bold text-green-600 uppercase tracking-widest">Hits</div>
                                    </div>
                                    <div className="bg-red-50 p-3 rounded-xl border border-red-100 text-center">
                                        <div className="text-2xl font-black text-red-700">{stats.misses}</div>
                                        <div className="text-[10px] font-bold text-red-600 uppercase tracking-widest">Misses</div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Right Column: Topics Timeline */}
                    <div className="lg:col-span-2">
                        <Card className="border-none shadow-md h-full min-h-[600px]">
                            <CardHeader className="border-b bg-muted/10">
                                <CardTitle className="flex justify-between items-center">
                                    <span>Curriculum Progress</span>
                                    <Badge variant="outline" className="font-mono">
                                        {topics.length} Total Topics
                                    </Badge>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 overflow-auto max-h-[700px]">
                                <table className="w-full text-left border-collapse">
                                    <thead className="bg-muted/50 sticky top-0 z-10 backdrop-blur-md">
                                        <tr>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Date</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Topic / Subject</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Group</th>
                                            <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y">
                                        {topics.length > 0 ? topics.map((topic: any, i: number) => (
                                            <tr key={i} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-2 text-sm font-bold text-foreground">
                                                        <Clock className="w-3 h-3 text-primary" />
                                                        {topic.scheduled_date ? new Date(topic.scheduled_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : 'TBD'}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div>
                                                        <div className="font-bold text-sm text-foreground">{topic.name}</div>
                                                        <div className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">{topic.subject || '-'}</div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-muted-foreground italic">{topic.groupName}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    {topic.completion_status === 'DONE' ? (
                                                        <CheckCircle2 className="w-5 h-5 text-green-500 mx-auto" />
                                                    ) : topic.completion_status === 'MISSED' ? (
                                                        <XCircle className="w-5 h-5 text-red-500 mx-auto" />
                                                    ) : (
                                                        <div className="w-5 h-5 rounded-full border-2 border-muted mx-auto"></div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center text-muted-foreground italic">
                                                    No syllabus topics assigned or planned yet.
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
