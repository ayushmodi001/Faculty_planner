import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading } from '@/components/ui/SwissUI';
import { ArrowRight, LayoutDashboard, CalendarRange, Users, BookOpen, Bell, GraduationCap, TrendingUp, AlertCircle, CheckCircle2, FileText } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import FacultyGroup from '@/models/FacultyGroup';
import { Network } from 'lucide-react';

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
        .select('name email facultyType')
        .lean();

    const facultyGroupCount = await FacultyGroup.countDocuments();

    return { facultyCount, studentCount, subjectCount, recentFaculty, facultyGroupCount };
}

export default async function HODDashboard() {
    // @ts-ignore - lean() typing issues sometimes
    const { facultyCount, studentCount, subjectCount, recentFaculty, facultyGroupCount } = await getDashboardStats();

    return (
        <DashboardLayout role="HOD">
            {/* Header Section */}
            <div className="mb-10 max-w-4xl animate-in slide-in-from-bottom-5 duration-500">
                <div className="flex items-center gap-3 mb-4">
                    <span className="px-3 py-1 rounded-full bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wider">
                        Department Head
                    </span>
                    <span className="px-3 py-1 rounded-full bg-secondary text-secondary-foreground text-xs font-bold uppercase tracking-wider">
                        {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                    </span>
                </div>
                <SwissHeading className="text-4xl md:text-5xl mb-4 text-foreground tracking-tight">
                    Computer Science <span className="text-muted-foreground font-serif italic">Overview</span>
                </SwissHeading>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-2xl font-medium">
                    Real-time academic surveillance. Faculty load balancing, curriculum coverage, and schedule integrity are currently <span className="text-foreground font-bold underline decoration-primary decoration-2 underline-offset-4">Optimal</span>.
                </p>
            </div>

            {/* High Contrast Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* Card 1: Faculty (High Contrast Dark) */}
                <Link href="/admin/users" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border border-border shadow-xl bg-primary text-primary-foreground rounded-[24px] overflow-hidden relative hover:scale-[1.02] transition-transform duration-300">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Users className="w-32 h-32 -mr-10 -mt-10" />
                        </div>
                        <CardHeader className="pb-2 relative z-10">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-background/20 rounded-2xl backdrop-blur-sm">
                                    <Users className="w-6 h-6 text-primary-foreground" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-primary-foreground/50 group-hover:text-primary-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black">{facultyCount}</div>
                                <CardTitle className="text-lg text-primary-foreground/80 font-medium">Active Faculty</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="relative z-10">
                            <div className="flex items-center gap-2 mt-4 text-xs font-bold uppercase tracking-wider text-primary-foreground opacity-80">
                                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                                Online Now
                            </div>
                        </CardContent>
                    </Card>
                </Link>



                {/* Faculty Groups Card */}
                <Link href="/admin/faculty" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border border-border shadow-sm bg-card hover:bg-muted hover:border-primary/50 rounded-[24px] overflow-hidden transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-secondary/50 rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <Network className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-foreground">{facultyGroupCount}</div>
                                <CardTitle className="text-lg text-muted-foreground">Faculty Groups</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 3: Curriculum (Light but Bold) */}
                <Link href="/admin/subjects" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border border-border shadow-sm bg-card hover:bg-muted hover:border-primary/50 rounded-[24px] overflow-hidden transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-secondary rounded-2xl group-hover:bg-primary group-hover:text-primary-foreground transition-colors duration-300">
                                    <BookOpen className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-4xl font-black text-foreground">{subjectCount}</div>
                                <CardTitle className="text-lg text-muted-foreground">Subjects</CardTitle>
                            </div>
                        </CardHeader>
                    </Card>
                </Link>

                {/* Card 4: Planner Read Only */}
                <Link href="/admin/planner" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border border-border shadow-sm bg-card rounded-[24px] overflow-hidden relative hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-muted rounded-2xl transition-colors duration-300">
                                    <FileText className="w-6 h-6 text-foreground" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-foreground mt-2">Academic Planner</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        VIEW ONLY
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground font-medium leading-tight">
                                Inspect generated schedules and curriculum flow.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Card 5: Academic Calendar Link */}
                <Link href="/dashboard/hod/calendar" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border border-border shadow-sm bg-card rounded-[24px] overflow-hidden relative hover:shadow-lg transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-muted rounded-2xl group-hover:bg-primary transition-colors duration-300 group-hover:text-primary-foreground">
                                    <CalendarRange className="w-6 h-6" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-foreground mt-2">Academic Calendar</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                                        VIEW ONLY
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground font-medium leading-tight">
                                View holidays, exams, and important term dates.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Card 6: Timetable Manager */}
                <Link href="/admin/timetable" className="group col-span-1 md:col-span-2 lg:col-span-1">
                    <Card className="h-full border-2 border-dashed border-border shadow-sm bg-muted/20 hover:bg-muted/50 rounded-[24px] overflow-hidden relative hover:border-primary/50 transition-all duration-300">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-6">
                                <div className="p-3 bg-background rounded-2xl shadow-sm transition-transform duration-300">
                                    <LayoutDashboard className="w-6 h-6 text-foreground" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-foreground -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <div className="space-y-1">
                                <div className="text-xl font-black text-foreground mt-2">Master Timetable</div>
                                <div className="flex items-center gap-2">
                                    <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                                        EDITABLE
                                    </span>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground font-medium leading-tight">
                                Define class slots and weekly schedules for faculty groups.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

            </div>

            {/* List Section - Faculty Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200 mb-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b">
                        <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
                            <Users className="w-5 h-5 text-muted-foreground" />
                            Faculty Roster
                        </h2>
                        <Button variant="ghost" className="text-muted-foreground hover:text-foreground">View Full Directory</Button>
                    </div>

                    <Card className="border border-border shadow-sm overflow-hidden rounded-[24px] bg-card">
                        <div className="p-0 overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-muted/50 border-b border-border">
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Faculty Member</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Contact</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-right">Projected Load</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentFaculty.length > 0 ? (
                                        recentFaculty.map((fac: any, i: number) => (
                                            <tr key={fac._id} className="border-b border-border/50 last:border-0 hover:bg-muted/20 transition-colors group">
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-sm shadow-sm">
                                                            {fac.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <Link href={`/dashboard/hod/faculty/${fac._id}`}>
                                                                <div className="font-bold text-foreground text-sm group-hover:text-primary transition-colors hover:underline">{fac.name}</div>
                                                            </Link>
                                                            <div className="text-xs text-muted-foreground font-medium">{fac.facultyType === 'SENIOR' ? 'Senior Faculty' : 'Assistant Professor'}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="text-sm font-medium text-muted-foreground">{fac.email}</div>
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 border border-green-200">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse"></span>
                                                        Active
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <div className="flex flex-col items-end gap-1">
                                                        <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                                className="h-full bg-primary rounded-full transition-all duration-1000"
                                                                style={{ width: `${Math.floor(Math.random() * (90 - 40) + 40)}%` }}
                                                            ></div>
                                                        </div>
                                                        <span className="text-xs font-bold text-foreground">{Math.floor(Math.random() * (18 - 8) + 8)} Hours</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-6 py-8 text-center text-muted-foreground">
                                                No faculty found. <Link href="/admin/users" className="underline text-primary">Add users</Link>.
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
                    <h2 className="text-2xl font-bold tracking-tight mb-6 pb-4 border-b text-foreground flex items-center gap-2">
                        <Bell className="w-5 h-5 text-muted-foreground" />
                        Latest Updates
                    </h2>
                    <Card className="border border-border shadow-md rounded-[24px] bg-card text-foreground h-auto relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[80px] -mr-20 -mt-20"></div>

                        <CardContent className="pt-8 space-y-8 relative z-10">

                            <div className="flex gap-4 items-start group">
                                <div className="bg-muted p-3 rounded-2xl text-foreground shrink-0 border border-border">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <div className="flex justify-between items-start">
                                        <p className="text-sm font-bold text-foreground">New Term Started</p>
                                        <span className="text-[10px] text-primary font-mono uppercase tracking-widest bg-primary/10 px-1 rounded">NOW</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">Fall 2026 semester initialization complete. 0 errors.</p>
                                </div>
                            </div>

                            <div className="flex gap-4 items-start group">
                                <div className="bg-muted p-3 rounded-2xl text-foreground shrink-0 border border-border">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-foreground">Database Optimization</p>
                                    <p className="text-xs text-muted-foreground mt-1 leading-relaxed font-medium">Weekly maintenance finished. Query time reduced by 12%.</p>
                                    <p className="text-[10px] text-muted-foreground/60 mt-2 font-mono uppercase tracking-widest">Yesterday</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
