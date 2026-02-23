'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { MapPin, Loader2, BookOpen, AlertCircle, ArrowRight, CalendarCheck, Clock, Users2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { toast } from 'sonner';

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
    topicId?: string;
    planId?: string;
    topicStatus?: string;
}

interface IDashboardData {
    facultyName: string;
    date: string;
    schedule: ILectureSlot[];
}

export default function FacultyDashboard() {
    const [data, setData] = useState<IDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    const handleStatusUpdate = async (planId: string, topicId: string, status: string) => {
        try {
            const res = await fetch('/api/faculty/dashboard/topic', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ planId, topicId, status })
            });
            if (!res.ok) throw new Error("Failed to update status");
            toast.success(`Topic marked as ${status}`);
            const refreshRes = await fetch('/api/faculty/dashboard');
            if (refreshRes.ok) {
                const updatedData = await refreshRes.json();
                setData(updatedData);
            }
        } catch (error) {
            toast.error("Could not update topic status");
        }
    };

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch('/api/faculty/dashboard');
                if (!res.ok) throw new Error("Failed to load dashboard data");
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error(err);
                toast.error("Could not load your schedule");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <DashboardLayout role="Faculty">
                <div className="flex items-center justify-center h-[60vh]">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5C6836]" />
                </div>
            </DashboardLayout>
        );
    }

    const lectures = data?.schedule || [];
    const activeLecture = lectures[0];

    return (
        <DashboardLayout role="Faculty">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
                <div className="max-w-3xl">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                            {data?.date || "Today"}
                        </span>
                    </div>
                    <SwissHeading className="text-4xl md:text-5xl mb-2 text-foreground tracking-tight">
                        Welcome, <span className="text-muted-foreground italic font-serif">{data?.facultyName}</span>
                    </SwissHeading>
                    <p className="text-lg text-muted-foreground leading-relaxed font-medium">
                        You have <span className="font-bold text-foreground underline decoration-primary decoration-2 underline-offset-4">{lectures.length} lectures</span> scheduled for today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Link href="/dashboard/faculty/planner">
                        <Button variant="outline" className="text-foreground hover:bg-primary hover:text-primary-foreground transition-colors group">
                            <CalendarCheck className="w-4 h-4 mr-2 text-muted-foreground group-hover:text-primary-foreground" /> Full Schedule
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* Left Column: Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between border-b pb-4 mb-6">
                        <h2 className="text-2xl font-bold text-foreground flex items-center gap-2 tracking-tight">
                            <Clock className="w-5 h-5 text-muted-foreground" />
                            Today's Timeline
                        </h2>
                    </div>

                    {lectures.length === 0 ? (
                        <Card className="border-2 border-dashed bg-muted/20 rounded-[24px]">
                            <CardContent className="py-16 text-center text-muted-foreground">
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-foreground/40" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">No lectures scheduled</h3>
                                <p className="text-sm mt-1">Enjoy your free time or prepare for upcoming classes.</p>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="space-y-6">
                            {lectures.map((lecture, idx) => {
                                const isFirst = idx === 0;
                                return (
                                    <div key={lecture.id} className="relative pl-6 sm:pl-0">
                                        {/* Timeline Connector */}
                                        <div className="absolute left-0 sm:-left-4 top-0 bottom-0 w-px bg-border hidden sm:block"></div>

                                        <Card className={`rounded-[24px] border border-border shadow-sm transition-all duration-300 ${isFirst ? 'bg-primary text-primary-foreground ring-2 ring-ring ring-offset-2' : 'bg-card hover:bg-accent hover:text-accent-foreground'}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-2">
                                                        {isFirst && (
                                                            <Badge className="bg-background text-foreground border-border animate-pulse font-bold">
                                                                Active Now
                                                            </Badge>
                                                        )}
                                                        <span className={`font-mono text-sm font-bold opacity-80 mt-1`}>
                                                            {lecture.formattedTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                <CardTitle className={`text-xl mt-1 tracking-tight`}>
                                                    {lecture.subject}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 opacity-80`}>
                                                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {lecture.room}</div>
                                                    <div className="flex items-center gap-1.5"><Users2 className="w-4 h-4" /> {lecture.groupName}</div>
                                                </div>

                                                <div className={`p-4 rounded-xl border ${isFirst ? 'bg-background/10 border-background/20' : 'bg-muted/50 border-border'}`}>
                                                    <div className="flex justify-between items-start">
                                                        <div>
                                                            <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 opacity-70`}>Lecture Topic</p>
                                                            <p className={`font-medium text-lg leading-snug`}>
                                                                {lecture.topic}
                                                            </p>
                                                        </div>
                                                        {lecture.topicStatus && lecture.topicStatus !== 'PENDING' && (
                                                            <Badge variant="default" className="bg-background text-foreground shrink-0 border border-primary">
                                                                {lecture.topicStatus}
                                                            </Badge>
                                                        )}
                                                    </div>

                                                    {!lecture.isPlanActive && lecture.topic !== "No topic scheduled for today" && (
                                                        <p className="text-xs mt-2 italic opacity-60">(Syllabus plan not generated yet)</p>
                                                    )}

                                                    {lecture.isPlanActive && lecture.topicId && lecture.topicStatus === 'PENDING' && (
                                                        <div className="flex gap-2 mt-4 pt-3 border-t border-border/10">
                                                            <Button size="sm" variant="secondary" className="flex-1 bg-green-600/20 text-green-700 hover:bg-green-600/30 hover:text-green-800 border-0" onClick={() => handleStatusUpdate(lecture.planId!, lecture.topicId!, 'DONE')}>
                                                                Mark Completed
                                                            </Button>
                                                            <Button size="sm" variant="outline" className="flex-1 bg-yellow-600/20 text-yellow-700 hover:bg-yellow-600/30 hover:text-yellow-800 border-0" onClick={() => handleStatusUpdate(lecture.planId!, lecture.topicId!, 'CONTINUED')}>
                                                                Mark Continued
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Right Column: Actions */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-bold tracking-tight mb-4 text-foreground border-b pb-4">Quick Actions</h2>

                    {/* Academic Calendar Link */}
                    <Link href="/dashboard/faculty/calendar" className="block">
                        <Card className="hover:border-primary cursor-pointer transition-all border-border bg-card rounded-[24px] shadow-sm mb-4 group">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="p-3 bg-muted group-hover:bg-primary group-hover:text-primary-foreground transition-colors rounded-2xl">
                                    <CalendarCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-foreground text-sm">Academic Calendar</p>
                                    <p className="text-xs text-muted-foreground mt-0.5">Holidays & Term Dates</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Academic Planner Link */}
                    <Link href="/dashboard/faculty/planner" className="block">
                        <Card className="group cursor-pointer border border-border shadow-md bg-secondary text-secondary-foreground rounded-[24px] overflow-hidden relative hover:shadow-xl hover:border-primary transition-all mb-4">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-background rounded-2xl shadow-sm text-foreground">
                                        <BookOpen className="w-6 h-6" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 opacity-60 group-hover:translate-x-1 group-hover:opacity-100 transition-all" />
                                </div>
                                <h3 className="text-lg font-bold">Academic Planner</h3>
                                <p className="text-sm opacity-80 mt-1">View syllabus progression and upcoming topics.</p>
                            </CardContent>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-background opacity-10 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        </Card>
                    </Link>

                    <Card className="hover:border-destructive cursor-pointer transition-colors border-border bg-card rounded-[24px] shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="p-3 bg-destructive/10 text-destructive rounded-2xl">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-foreground text-sm">Report Issue</p>
                                <p className="text-xs text-muted-foreground mt-0.5">Flag scheduling conflict</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-muted/50 rounded-[24px] border border-border mt-8">
                        <h4 className="font-bold text-foreground mb-2 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-primary animate-pulse"></div>
                            Did you know?
                        </h4>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                            The AI engine has optimized your schedule to free up Thursday afternoons based on your preferences.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
