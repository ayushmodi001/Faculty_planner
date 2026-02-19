import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { MapPin, Users2, Loader2, BookOpen, AlertCircle } from 'lucide-react';
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
}

interface IDashboardData {
    facultyName: string;
    date: string;
    schedule: ILectureSlot[];
}

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
                    <Loader2 className="w-10 h-10 animate-spin text-primary" />
                </div>
            </DashboardLayout>
        );
    }

    const lectures = data?.schedule || [];
    const activeLecture = lectures[0]; // Simplified: First one is active/next

    return (
        <DashboardLayout role="Faculty">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
                <div className="max-w-2xl">
                    <SwissSubHeading className="mb-2 text-primary">Your Schedule - {data?.date}</SwissSubHeading>
                    <SwissHeading className="text-4xl">Welcome back, {data?.facultyName}</SwissHeading>
                    <p className="text-lg text-muted-foreground mt-2">
                        You have <span className="font-bold text-foreground">{lectures.length} lectures</span> scheduled for today.
                    </p>
                </div>
                <Button size="lg" className="shadow-lg shadow-primary/20">View Full Timetable</Button>
            </div>

            {/* Today's Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                <div className="lg:col-span-2 space-y-6">
                    <SwissHeading className="text-2xl mb-4">Today's Lectures</SwissHeading>

                    {lectures.length === 0 ? (
                        <Card className="border-dashed">
                            <CardContent className="py-10 text-center text-muted-foreground">
                                No lectures scheduled for today. Enjoy your day!
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="relative pl-8 border-l-2 border-primary space-y-8">
                            {lectures.map((lecture, idx) => {
                                const isFirst = idx === 0; // Highlight first as active for demo
                                return (
                                    <div key={lecture.id} className="relative">
                                        <div className={`absolute -left-[41px] top-2 w-4 h-4 rounded-full border-2 ${isFirst ? 'bg-primary border-primary ring-4 ring-primary/20' : 'bg-muted border-muted-foreground'}`}></div>

                                        <Card className={`${isFirst ? 'bg-primary text-primary-foreground shadow-xl transform scale-[1.02]' : 'opacity-90 hover:opacity-100'} transition-all`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <Badge className={isFirst ? "bg-white/20 text-white hover:bg-white/30 border-none" : "variant-secondary"}>
                                                        {isFirst ? "Next / Active" : "Upcoming"}
                                                    </Badge>
                                                    <span className={`font-mono text-sm ${isFirst ? 'opacity-80' : 'text-muted-foreground'}`}>
                                                        {lecture.formattedTime}
                                                    </span>
                                                </div>
                                                <CardTitle className={`text-xl mt-2 ${!isFirst && 'text-foreground'}`}>
                                                    {lecture.subject}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={`flex items-center gap-4 text-sm mb-4 ${isFirst ? 'opacity-90' : 'text-muted-foreground'}`}>
                                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {lecture.room}</div>
                                                    <div className="flex items-center gap-1"><Users2 className="w-4 h-4" /> {lecture.groupName}</div>
                                                </div>

                                                <div className={`p-4 rounded-lg border ${isFirst ? 'bg-white/10 border-white/10' : 'bg-muted/30 border-border'}`}>
                                                    <p className={`text-xs uppercase tracking-wider font-bold mb-1 ${isFirst ? 'opacity-70' : 'text-muted-foreground'}`}>Today's Topic</p>
                                                    <p className={`font-medium text-lg leading-snug ${!isFirst && 'text-foreground'}`}>
                                                        {lecture.topic}
                                                    </p>
                                                    {!lecture.isPlanActive && lecture.topic !== "No topic scheduled for today" && (
                                                        <p className="text-xs mt-2 italic opacity-70">(Syllabus plan not generated yet)</p>
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

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <SwissHeading className="text-2xl mb-4">Quick Actions</SwissHeading>
                    <div className="grid gap-4">
                        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Update Syllabus</p>
                                    <p className="text-xs text-muted-foreground">Log lecture completion</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Report Issue</p>
                                    <p className="text-xs text-muted-foreground">Flag scheduling conflict</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 mt-8">
                        <h4 className="font-bold text-slate-800 mb-2">Did you know?</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            The AI engine has optimized your schedule to free up Thursday afternoons based on your preferences.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

function Users2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
