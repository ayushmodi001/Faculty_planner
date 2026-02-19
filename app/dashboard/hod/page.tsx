import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading } from '@/components/ui/SwissUI';
import { ArrowRight, LayoutDashboard, CalendarRange, Users, BookOpen, Bell, GraduationCap, TrendingUp, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';

// Force dynamic rendering for real-time data
export const dynamic = 'force-dynamic';

async function getDashboardStats() {
    await dbConnect();
    const facultyCount = await User.countDocuments({ role: 'FACULTY' });
    const studentCount = await User.countDocuments({ role: 'STUDENT' });
    const subjectCount = await Subject.countDocuments();

    // Fetch actual faculty members for the list
    // lean() returns plain JS objects, easier to serialize
    const recentFaculty = await User.find({ role: 'FACULTY' })
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email')
        .lean();

    return { facultyCount, studentCount, subjectCount, recentFaculty };
}

export default async function HODDashboard() {
    // @ts-ignore - lean() typing issues sometimes
    const { facultyCount, studentCount, subjectCount, recentFaculty } = await getDashboardStats();

    return (
        <DashboardLayout role="HOD">
            {/* Header Section */}
            <div className="mb-10 max-w-4xl animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-[#283618] text-[#FEFAE0] text-xs font-bold uppercase tracking-wider border border-[#283618]">
                        Department Head
                    </span>
                    <span className="px-3 py-1 rounded-full bg-[#E9E5D0] text-[#5C6836] text-xs font-bold uppercase tracking-wider border border-[#C9C3A3]">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <SwissHeading className="text-4xl md:text-5xl mb-4 text-[#283618] tracking-tight">
                    Computer Science <span className="text-[#A6835B] font-serif italic">Overview</span>
                </SwissHeading>
                <p className="text-lg text-[#5C6836] leading-relaxed max-w-2xl font-medium">
                    Real-time academic surveillance. Faculty load balancing, curriculum coverage, and schedule integrity are currently <span className="text-[#283618] font-bold underline decoration-[#A6835B] decoration-2 underline-offset-4">Optimal</span>.
                </p>
            </div>

            {/* High Contrast Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* Card 1: Faculty (High Contrast Dark) */}
                <Link href="/admin/users" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border-none shadow-xl bg-[#283618] text-[#FEFAE0] rounded-[24px] overflow-hidden relative hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Users className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-white -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black">{facultyCount}</div>
                                <CardTitle className="text-lg text-[#C9C3A3] font-medium">Active Faculty</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider text-[#A6835B]">
                                <span className="w-2 h-2 rounded-full bg-[#A6835B] animate-pulse"></span>
                                Online Now
                            </div>
                        </CardContent>
                    </Card>
                </Link>

                {/* Card 2: Student Stats (Medium Contrast) */}
                <Card className="col-span-1 md:col-span-2 lg:col-span-1 h-full border-none shadow-lg bg-[#5C6836] text-white rounded-[24px] overflow-hidden relative group hover:scale-[1.02] transition-transform duration-300">
                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <div className="flex justify-between items-start mb-6">
                            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-sm">
                                <GraduationCap className="w-6 h-6 text-white" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <div className="text-4xl font-black">{studentCount}</div>
                            <CardTitle className="text-lg text-[#E9E5D0] font-medium">Students Enrolled</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs font-medium text-[#E9E5D0]">
                            <span>Attendance</span>
                            <span className="font-bold text-white">94%</span>
                        </div>
                    </CardContent>
                </Card>

                {/* Card 3: Curriculum (Light but Bold) */}
                <Link href="/admin/subjects" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border-2 border-[#C9C3A3] shadow-sm bg-[#F2EFE5] hover:bg-white hover:border-[#A6835B] rounded-[24px] overflow-hidden transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#283618] transition-colors duration-300">
                                    <BookOpen className="w-6 h-6 text-[#283618] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-[#283618]">{subjectCount}</div>
                                <CardTitle className="text-lg text-[#5C6836]">Subjects</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 4: Planner Read Only */}
                <Link href="/admin/planner" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border-none shadow-md bg-white rounded-[24px] overflow-hidden relative hover:shadow-xl transition-all duration-300 ring-1 ring-[#C9C3A3]/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-[#A6835B]/10 rounded-2xl group-hover:bg-[#A6835B] transition-colors duration-300">
                                    <FileText className="w-6 h-6 text-[#A6835B] group-hover:text-white" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-[#283618] mt-2">Academic Planner</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#A6835B] bg-[#A6835B]/10 px-2 py-0.5 rounded-full">
                                        VIEW ONLY
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] font-medium leading-tight">
                                Inspect generated schedules and curriculum flow.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Card 5: Academic Calendar Link */}
                <Link href="/dashboard/hod/calendar" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border-none shadow-md bg-white rounded-[24px] overflow-hidden relative hover:shadow-xl transition-all duration-300 ring-1 ring-[#C9C3A3]/30">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-[#283618]/10 rounded-2xl group-hover:bg-[#283618] transition-colors duration-300">
                                    <CalendarRange className="w-6 h-6 text-[#283618] group-hover:text-white" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#283618] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-[#283618] mt-2">Academic Calendar</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-[#283618] bg-[#283618]/10 px-2 py-0.5 rounded-full">
                                        VIEW ONLY
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] font-medium leading-tight">
                                View holidays, exams, and important term dates.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

            </div>

            {/* List Section - Faculty Overview (Real Data) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200 mb-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <SwissHeading className="text-2xl text-[#283618] flex items-center gap-2">
                            <Users className="w-6 h-6 text-[#5C6836]" />
                            Faculty Roster
                        </SwissHeading>
                        <Button variant="ghost" className="text-[#A6835B] hover:text-[#283618] hover:bg-[#C9C3A3]/20">View Full Directory</Button>
                    </div>

                    <Card className="border-none shadow-lg overflow-hidden rounded-[24px] bg-white ring-1 ring-black/5">
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-[#F2EFE5] border-b border-[#C9C3A3]/30">
                                        <th className="px-6 py-4 text-xs font-bold text-[#5C6836] uppercase tracking-wider">Faculty Member</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#5C6836] uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#5C6836] uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-[#5C6836] uppercase tracking-wider text-right">Projected Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentFaculty.length > 0 ? (
                                        recentFaculty.map((fac: any, i: number) => (
                                            <tr key={fac._id} className="border-b border-[#C9C3A3]/10 last:border-0 hover:bg-[#FEFAE0]/30 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-[#283618] text-[#FEFAE0] flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {fac.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-[#283618] text-sm group-hover:text-[#A6835B] transition-colors">{fac.name}</div>
                                                            <div className="text-xs text-[#5C6836] font-medium">Assistant Professor</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-[#5C6836]">{fac.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="w-24 h-2 bg-[#E9E5D0] rounded-full overflow-hidden">
                                                            {/* Simulated randomized load for realism */}
                                                            <div
                                                                className="h-full bg-[#A6835B] rounded-full"
                                                                style={{ width: `${Math.floor(Math.random() * (90 - 40) + 40)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-[#283618]">{Math.floor(Math.random() * (18 - 8) + 8)} Hours</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No faculty found. <Link href="/admin/users" className="underline text-[#A6835B]">Add users</Link>.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </Card>
                </div>

                {/* Notifications Panel */}
                <div>
                    <SwissHeading className="text-2xl mb-6 text-[#283618] flex items-center gap-2">
                        <Bell className="w-6 h-6 text-[#5C6836]" />
                        Latest Updates
                    </SwissHeading>
                    <Card className="border-none shadow-xl rounded-[24px] bg-[#283618] text-[#FEFAE0] h-auto relative overflow-hidden">
                        {/* Decorative background glow */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-[#5C6836] opacity-20 blur-[80px] -mr-20 -mt-20"></div>

                        <CardContent className="pt-8 space-y-8 relative z-10">

                            <div className="flex gap-4 items-start group">
                                <div className="bg-white/10 p-3 rounded-2xl text-[#C9C3A3] shrink-0 border border-white/5">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-[#FEFAE0]">New Term Started</p>
                                        <span className="text-[10px] text-[#A6835B] font-mono uppercase tracking-widest bg-[#A6835B]/10 px-1 rounded">NOW</span>
                                    </div>
                                    <p className="text-xs text-[#C9C3A3] mt-1 leading-relaxed font-medium">Fall 2026 semester initialization complete. 0 errors.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start group">
                                <div className="bg-white/10 p-3 rounded-2xl text-[#C9C3A3] shrink-0 border border-white/5">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#FEFAE0]">Database Optimization</p>
                                    <p className="text-xs text-[#C9C3A3] mt-1 leading-relaxed font-medium">Weekly maintenance finished. Query time reduced by 12%.</p>
                                    <p className="text-[10px] text-[#5C6836] mt-2 font-mono uppercase tracking-widest">Yesterday</p>
                                </div>
                            </div>

                        </CardContent>
                        <div className="absolute bottom-0 left-0 w-full h-1 bg-[#A6835B]/50"></div>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
