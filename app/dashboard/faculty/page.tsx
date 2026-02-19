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
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-[#E9E5D0] text-[#5C6836] text-xs font-bold uppercase tracking-wider border border-[#C9C3A3]">
                            {data?.date || "Today"}
                        </span>
                    </div>
                    <SwissHeading className="text-4xl md:text-5xl mb-2 text-[#283618] tracking-tight">
                        Welcome, <span className="text-[#A6835B] font-serif italic">{data?.facultyName}</span>
                    </SwissHeading>
                    <p className="text-lg text-[#5C6836] leading-relaxed font-medium">
                        You have <span className="font-bold text-[#283618] underline decoration-[#A6835B] decoration-2 underline-offset-4">{lectures.length} lectures</span> scheduled for today.
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="border-[#C9C3A3] text-[#5C6836] hover:bg-[#283618] hover:text-[#FEFAE0]">
                        <CalendarCheck className="w-4 h-4 mr-2" /> Full Schedule
                    </Button>
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* Left Column: Timeline */}
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between">
                        <SwissHeading className="text-2xl text-[#283618] flex items-center gap-2">
                            <Clock className="w-6 h-6 text-[#5C6836]" />
                            Today's Timeline
                        </SwissHeading>
                    </div>

                    {lectures.length === 0 ? (
                        <Card className="border-2 border-dashed border-[#C9C3A3] bg-[#FEFAE0]/50 rounded-[24px]">
                            <CardContent className="py-12 text-center text-[#5C6836]">
                                <div className="w-16 h-16 bg-[#E9E5D0] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <BookOpen className="w-8 h-8 text-[#A6835B]" />
                                </div>
                                <h3 className="text-lg font-bold text-[#283618]">No lectures scheduled</h3>
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
                                        <div className="absolute left-0 sm:-left-4 top-0 bottom-0 w-0.5 bg-[#C9C3A3]/30 hidden sm:block"></div>

                                        <Card className={`rounded-[24px] border-none shadow-lg transition-all duration-300 ${isFirst ? 'bg-[#283618] text-[#FEFAE0] ring-4 ring-[#C9C3A3]/20' : 'bg-white hover:bg-[#FEFAE0] text-[#283618]'}`}>
                                            <CardHeader className="pb-2">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex gap-2">
                                                        {isFirst && (
                                                            <Badge className="bg-[#A6835B] text-white border-none animate-pulse">
                                                                Active Now
                                                            </Badge>
                                                        )}
                                                        <span className={`font-mono text-sm font-bold ${isFirst ? 'text-[#C9C3A3]' : 'text-[#5C6836]'}`}>
                                                            {lecture.formattedTime}
                                                        </span>
                                                    </div>
                                                </div>
                                                <CardTitle className={`text-xl mt-1 ${isFirst ? 'text-white' : 'text-[#283618]'}`}>
                                                    {lecture.subject}
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className={`flex flex-wrap items-center gap-4 text-sm mb-4 ${isFirst ? 'text-[#C9C3A3]' : 'text-[#5C6836]'}`}>
                                                    <div className="flex items-center gap-1.5"><MapPin className="w-4 h-4" /> {lecture.room}</div>
                                                    <div className="flex items-center gap-1.5"><Users2 className="w-4 h-4" /> {lecture.groupName}</div>
                                                </div>

                                                <div className={`p-4 rounded-xl border ${isFirst ? 'bg-white/10 border-white/5' : 'bg-[#F2EFE5] border-[#E9E5D0]'}`}>
                                                    <p className={`text-[10px] uppercase tracking-wider font-bold mb-1 ${isFirst ? 'text-[#A6835B]' : 'text-[#5C6836]'}`}>Lecture Topic</p>
                                                    <p className={`font-medium text-lg leading-snug ${isFirst ? 'text-white' : 'text-[#283618]'}`}>
                                                        {lecture.topic}
                                                    </p>
                                                    {!lecture.isPlanActive && lecture.topic !== "No topic scheduled for today" && (
                                                        <p className="text-xs mt-2 italic opacity-60">(Syllabus plan not generated yet)</p>
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
                    <SwissHeading className="text-2xl mb-4 text-[#283618]">Quick Actions</SwissHeading>

                    {/* Academic Calendar Link */}
                    <Link href="/dashboard/faculty/calendar">
                        <Card className="hover:border-[#283618] cursor-pointer transition-colors border-[#C9C3A3] bg-white rounded-[24px] shadow-sm mb-4">
                            <CardContent className="flex items-center gap-4 p-5">
                                <div className="p-3 bg-[#E9E5D0] text-[#283618] rounded-2xl">
                                    <CalendarCheck className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-bold text-[#283618] text-sm">Academic Calendar</p>
                                    <p className="text-xs text-[#5C6836] mt-0.5">Holidays & Term Dates</p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Academic Planner Link */}
                    <Link href="/dashboard/faculty/planner">
                        <Card className="group cursor-pointer border-none shadow-md bg-[#5C6836] text-white rounded-[24px] overflow-hidden relative hover:shadow-xl transition-all mb-4">
                            <CardContent className="p-6 relative z-10">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                        <BookOpen className="w-6 h-6 text-white" />
                                    </div>
                                    <ArrowRight className="w-5 h-5 text-[#E9E5D0] group-hover:translate-x-1 transition-transform" />
                                </div>
                                <h3 className="text-lg font-bold">Academic Planner</h3>
                                <p className="text-sm text-[#E9E5D0] mt-1 opacity-90">View syllabus progression and upcoming topics.</p>
                            </CardContent>
                            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full -mr-10 -mt-10 blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
                        </Card>
                    </Link>

                    <Card className="hover:border-[#A6835B] cursor-pointer transition-colors border-[#C9C3A3] bg-white rounded-[24px] shadow-sm">
                        <CardContent className="flex items-center gap-4 p-5">
                            <div className="p-3 bg-[#FEFAE0] text-[#A6835B] rounded-2xl">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <p className="font-bold text-[#283618] text-sm">Report Issue</p>
                                <p className="text-xs text-[#5C6836] mt-0.5">Flag scheduling conflict</p>
                            </div>
                        </CardContent>
                    </Card>

                    <div className="p-6 bg-[#E9E5D0]/30 rounded-[24px] border border-[#C9C3A3]/50 mt-8">
                        <h4 className="font-bold text-[#283618] mb-2 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#A6835B]"></span>
                            Did you know?
                        </h4>
                        <p className="text-sm text-[#5C6836] leading-relaxed">
                            The AI engine has optimized your schedule to free up Thursday afternoons based on your preferences.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
