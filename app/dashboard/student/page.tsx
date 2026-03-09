import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight,
    Book,
    Calendar,
    CheckCircle2,
    GraduationCap,
    TrendingUp,
    BookOpen,
    Clock,
    LayoutGrid,
    Sparkles,
    ChevronRight,
    Activity,
    MapPin
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import User from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';
import Subject from '@/models/Subject';
import dbConnect from '@/lib/db';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function StudentDashboard() {
    await dbConnect();

    // --- Fetch User Context ---
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    let studentGroup = "Unassigned";
    let nextClass: any = null;
    let courseProgress: any[] = [];
    let userName = "Student";

    if (token) {
        const session = await verifyJWT(token);
        if (session) {
            const user = await User.findById(session.sub).lean();
            if (user) {
                userName = user.name.split(' ')[0];                if (user.facultyGroupId) {
                    const group = await FacultyGroup.findById(user.facultyGroupId)
                        .populate('subjectAssignments.subject_id', 'name')
                        .lean();
                    if (group) {
                        studentGroup = group.name;
                        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                        const todayStr = days[new Date().getDay()];
                        const timetableMap = group.timetable instanceof Map
                            ? Object.fromEntries(group.timetable)
                            : (group.timetable as any) || {};
                        const todaySlots = timetableMap[todayStr] || [];
                        if (todaySlots.length > 0) nextClass = todaySlots[0];

                        const plans = await Plan.find({ faculty_group_id: group._id })
                            .populate('subject_id', 'name')
                            .lean();
                        const subjectsFound = new Set<string>();
                        plans.forEach((p: any) => {
                            const subjectName = p.subject_id?.name || p.subject || 'Unknown';
                            if (!subjectsFound.has(subjectName)) {
                                subjectsFound.add(subjectName);
                                const total = p.syllabus_topics?.length || 0;
                                const completed = p.syllabus_topics?.filter((t: any) => t.completion_status === 'DONE').length || 0;
                                courseProgress.push({
                                    subject: subjectName,
                                    progress: total === 0 ? 0 : Math.round((completed / total) * 100)
                                });
                            }
                        });
                        // Fill in subjects from subjectAssignments that have no plan yet
                        const seenSubjects = new Set(
                            (group.subjectAssignments as any[] || []).map((a: any) => a.subject_id?.name).filter(Boolean)
                        );
                        seenSubjects.forEach((name: string) => {
                            if (!subjectsFound.has(name)) {
                                courseProgress.push({ subject: name, progress: 0 });
                            }
                        });
                    }
                }
            }
        }
    }

    return (
        <DashboardLayout role="Student">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome, {userName}</h1>
                        <p className="text-slate-500 text-sm mt-1">
                            Your current active group is <span className="font-bold text-slate-900">{studentGroup}</span>.
                        </p>
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

                    {/* Next Class Hero Card */}
                    <Card className="lg:col-span-8 bg-slate-900 text-white border-none overflow-hidden relative shadow-xl">
                        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                            <GraduationCap className="w-48 h-48 text-blue-500" />
                        </div>

                        <CardContent className="p-8 flex flex-col justify-between h-full min-h-[250px] relative z-10">
                            <div className="space-y-6">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-blue-600 text-white border-0 hover:bg-blue-600 uppercase font-bold text-[10px]">Upcoming Class</Badge>
                                    <Clock className="w-5 h-5 text-slate-500" />
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-4xl md:text-5xl font-bold tracking-tight">
                                        {nextClass ? nextClass.subject : "No Classes Scheduled"}
                                    </h2>
                                    <p className="text-slate-400 text-lg font-medium leading-relaxed">
                                        {nextClass ? (nextClass.faculty ? `With Prof. ${nextClass.faculty}` : "Standard Session") : "Check back later for your schedule."}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-8 items-center pt-8 border-t border-white/5 mt-8">
                                {nextClass && (
                                    <>
                                        <div className="flex items-center gap-2">
                                            <div className="w-2 h-2 bg-blue-500 rounded-full" />
                                            <div className="text-xs font-bold text-slate-300">
                                                {nextClass.startTime} — {nextClass.endTime}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-emerald-500" />
                                            <div className="text-xs font-bold text-slate-300">
                                                Location: {nextClass.room || 'TBA'}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Sidebar Metrics */}
                    <div className="lg:col-span-4 grid grid-cols-1 gap-4">                        {/* Attendance Widget */}
                        <Card className="border shadow-sm flex flex-col justify-between">
                            <CardHeader className="pb-2">
                                <CardTitle className="text-sm text-slate-500 font-bold uppercase tracking-wider">My Attendance</CardTitle>
                                <div className="flex items-baseline gap-1 pt-1">
                                    <span className="text-4xl font-black text-slate-900 tracking-tight">N/A</span>
                                    <Badge variant="outline" className="text-slate-400 bg-slate-50 border-slate-200 font-bold text-[10px] ml-2">COMING SOON</Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="pb-6">
                                <p className="text-xs text-slate-400 mt-2 font-medium">Attendance tracking will be available in a future update.</p>
                            </CardContent>
                        </Card>

                        {/* Quick Action Buttons */}
                        <div className="grid grid-cols-2 gap-3">
                            <Button className="h-24 flex flex-col gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 font-bold uppercase tracking-wide text-xs group" asChild>
                                <Link href="/dashboard/student/planner">
                                    <BookOpen className="w-5 h-5 mb-1" />
                                    View Syllabus
                                </Link>
                            </Button>
                            <Button variant="outline" className="h-24 flex flex-col gap-2 rounded-2xl border-slate-200 hover:bg-slate-50 font-bold uppercase tracking-wide text-xs text-slate-700" asChild>
                                <Link href="/dashboard/student/calendar">
                                    <Calendar className="w-5 h-5 mb-1 text-slate-400" />
                                    My Calendar
                                </Link>
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Course Progress Section */}
                <div className="space-y-4 pt-4">
                    <div className="flex items-center gap-2 px-1">
                        <h3 className="text-xl font-bold text-slate-900 tracking-tight">Subject Completion</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-8">
                        {courseProgress.length > 0 ? (
                            courseProgress.map((course, i) => (
                                <Card key={i} className="hover:shadow-md transition-all group border-slate-200">
                                    <CardContent className="p-6 space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="w-10 h-10 rounded-lg bg-slate-100 text-slate-400 flex items-center justify-center font-bold text-sm group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                <LayoutGrid className="w-5 h-5" />
                                            </div>
                                            <Badge variant="secondary" className="text-slate-500 font-bold text-[10px]">{course.progress}% DONE</Badge>
                                        </div>
                                        <div className="space-y-1">
                                            <h4 className="font-bold text-slate-900 text-lg tracking-tight truncate pr-2">{course.subject}</h4>
                                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Current Syllabus Progress</p>
                                        </div>
                                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full group-hover:bg-blue-500 transition-all" style={{ width: `${course.progress}%` }} />
                                        </div>
                                    </CardContent>
                                </Card>
                            ))
                        ) : (
                            <div className="col-span-full py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl bg-slate-50/50">
                                <p className="text-sm font-medium text-slate-400">Loading your subjects...</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
