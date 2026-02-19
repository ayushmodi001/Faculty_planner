import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, Book, Calendar, CheckCircle2, GraduationCap, TrendingUp, BookOpen, Clock } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function StudentDashboard() {
    return (
        <DashboardLayout role="Student">
            {/* Header Section */}
            <div className="mb-10 max-w-4xl animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#E9E5D0] text-[#5C6836] text-xs font-bold uppercase tracking-wider border border-[#C9C3A3]">
                        Student Portal
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#283618] text-[#FEFAE0] text-xs font-bold uppercase tracking-wider border border-[#283618]">
                        Sem 5 • Sec A
                    </span>
                </div>
                <SwissHeading className="text-4xl md:text-6xl mb-4 text-[#283618] tracking-tight">
                    My <span className="text-[#A6835B] font-serif italic">Academics</span>
                </SwissHeading>
                <p className="text-lg text-[#5C6836] leading-relaxed max-w-2xl font-medium">
                    Monitor your attendance, track assignments, and view course progression.
                </p>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* Next Class Card - Dark Green */}
                <Card className="bg-[#283618] text-[#FEFAE0] border-none col-span-1 md:col-span-2 relative overflow-hidden rounded-[24px] shadow-xl group hover:scale-[1.01] transition-transform duration-300">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#5C6836] rounded-full opacity-20 blur-[80px] -mr-16 -mt-16 group-hover:opacity-30 transition-opacity"></div>
                    <CardHeader className="relative z-10 pb-2">
                        <div className="flex justify-between items-start">
                            <Badge className="bg-[#A6835B] text-white border-none mb-3 animate-pulse">Now / Next</Badge>
                            <Clock className="w-5 h-5 text-[#C9C3A3]" />
                        </div>
                        <CardTitle className="text-3xl md:text-4xl font-black tracking-tight text-white">Applied Mathematics</CardTitle>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <p className="text-[#C9C3A3] mb-6 font-medium text-lg">Topic: Eigenvalues and Eigenvectors</p>
                        <div className="flex gap-6 text-sm font-bold uppercase tracking-wide text-[#E9E5D0]">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#A6835B]"></span>
                                10:30 AM
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-[#5C6836]"></span>
                                Lecture Hall 4
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Attendance Card */}
                <Card className="flex flex-col justify-between border-none shadow-md bg-white rounded-[24px] ring-1 ring-[#C9C3A3]/30 overflow-hidden relative group">
                    <CardHeader className="pb-1">
                        <div className="flex justify-between items-center mb-2">
                            <div className="p-2 bg-[#E9E5D0] rounded-xl text-[#5C6836]">
                                <CheckCircle2 className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-bold text-[#A6835B] uppercase tracking-wider">Overall</span>
                        </div>
                        <SwissSubHeading className="text-[#5C6836]">Attendance</SwissSubHeading>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-baseline gap-1">
                            <span className="text-5xl font-black text-[#283618] tracking-tighter">89</span>
                            <span className="text-xl font-bold text-[#5C6836]">%</span>
                        </div>
                        <p className="text-xs text-[#5C6836] mt-2 font-medium bg-[#FEFAE0] p-2 rounded-lg inline-block">
                            You are safely above the 75% threshold.
                        </p>
                    </CardContent>
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-[#E9E5D0]">
                        <div className="h-full bg-[#283618] w-[89%]"></div>
                    </div>
                </Card>

                {/* Planner / Assignments Card */}
                <Link href="/dashboard/student/planner" className="h-full">
                    <Card className="flex flex-col justify-between border-none shadow-md bg-[#5C6836] text-white rounded-[24px] overflow-hidden relative group hover:bg-[#4a542b] transition-colors cursor-pointer h-full">
                        <CardHeader className="pb-1">
                            <div className="flex justify-between items-center mb-2">
                                <div className="p-2 bg-white/20 rounded-xl text-white">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:translate-x-1 transition-transform" />
                            </div>
                            <SwissSubHeading className="text-[#E9E5D0]">Course Plan</SwissSubHeading>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="text-xl font-black tracking-tight text-white mb-2">View Roadmap</div>
                            <p className="text-xs text-[#E9E5D0]/80 font-medium">Click to track your syllabus progression.</p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Calendar Card */}
                <Link href="/dashboard/student/calendar" className="h-full col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="flex flex-col justify-between border-none shadow-md bg-white ring-1 ring-[#C9C3A3]/30 rounded-[24px] overflow-hidden relative group hover:shadow-lg transition-all cursor-pointer h-full">
                        <CardHeader className="pb-1">
                            <div className="flex justify-between items-center mb-2">
                                <div className="p-2 bg-[#E9E5D0] rounded-xl text-[#283618]">
                                    <Calendar className="w-5 h-5" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:translate-x-1 transition-transform" />
                            </div>
                            <SwissSubHeading className="text-[#5C6836]">Calendar</SwissSubHeading>
                        </CardHeader>
                        <CardContent className="pb-6">
                            <div className="text-xl font-black tracking-tight text-[#283618] mb-2">Academic Dates</div>
                            <p className="text-xs text-[#5C6836]/80 font-medium">View holidays and exam schedule.</p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Course Progress Section */}
            <div className="animate-in slide-in-from-bottom-10 duration-700 delay-200">
                <div className="flex items-center gap-3 mb-6">
                    <SwissHeading className="text-2xl text-[#283618]">Subject Progress</SwissHeading>
                    <div className="h-px flex-1 bg-[#C9C3A3]/30"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                    {[
                        { subject: "Data Structures", progress: 75, color: "bg-[#283618]", text: "text-[#FEFAE0]" },
                        { subject: "Operating Systems", progress: 60, color: "bg-[#A6835B]", text: "text-white" },
                        { subject: "Computer Networks", progress: 45, color: "bg-[#5C6836]", text: "text-white" },
                        { subject: "DBMS", progress: 90, color: "bg-[#C9C3A3]", text: "text-[#283618]" }
                    ].map((course, i) => (
                        <div key={i} className="bg-white border border-[#C9C3A3]/20 rounded-[20px] p-5 flex items-center gap-5 shadow-sm hover:shadow-md transition-shadow group">
                            <div className={`p-4 rounded-2xl ${course.color} ${course.text} shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                                <Book className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2 items-end">
                                    <span className="font-bold text-lg text-[#283618]">{course.subject}</span>
                                    <span className="text-sm font-bold text-[#A6835B] bg-[#FEFAE0] px-2 py-0.5 rounded-md">{course.progress}%</span>
                                </div>
                                <div className="h-2.5 w-full bg-[#E9E5D0] rounded-full overflow-hidden">
                                    <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </DashboardLayout>
    );
}
