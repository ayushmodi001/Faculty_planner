import Link from 'next/link';
import { cookies } from 'next/headers';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    ArrowRight, Users, BookOpen, GraduationCap, TrendingUp,
    ChevronRight, Activity, Layers, Calendar, Target,
    CheckCircle2, XCircle, Clock, Flame, BarChart3, AlertTriangle, TrendingDown
} from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';
import Department from '@/models/Department';
import { cn } from '@/lib/utils';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import { verifyJWT } from '@/lib/auth';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';

const MISSED_REASON_LABELS: Record<string, string> = {
    ON_LEAVE: 'On Leave',
    TOPIC_TOOK_LONGER: 'Topic Took Longer',
    HOLIDAY_CLASH: 'Holiday Clash',
    TECHNICAL_ISSUE: 'Technical Issue',
    LOW_ATTENDANCE: 'Low Attendance',
    OTHER: 'Other',
};

async function getHODDepartmentId(): Promise<string | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    if (!token) return null;
    const session = await verifyJWT(token);
    return (session?.department_id as string) ?? null;
}

async function getDashboardStats() {
    await dbConnect();
    await import('@/models/Subject');
    await import('@/models/User');

    const departmentId = await getHODDepartmentId();
    const deptFilter = departmentId ? { department_id: new mongoose.Types.ObjectId(departmentId) } : {};
    const deptFilterStr = departmentId ? { department_id: departmentId } : {};

    const [facultyCount, studentCount, subjectCount, facultyGroupCount] = await Promise.all([
        User.countDocuments({ role: 'FACULTY', isActive: true, ...deptFilter }),
        User.countDocuments({ role: 'STUDENT', isActive: true, ...deptFilter }),
        Subject.countDocuments(departmentId ? { department_id: new mongoose.Types.ObjectId(departmentId) } : {}),
        FacultyGroup.countDocuments(deptFilter),
    ]);

    const recentFaculty = await User.find({ role: 'FACULTY', ...deptFilter })
        .sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt').lean();

    // Plan aggregation with topic stats (scoped to department's groups)
    const deptGroups = await FacultyGroup.find(deptFilter).select('_id').lean();
    const deptGroupIds = deptGroups.map(g => g._id);

    const planAgg = await Plan.aggregate([
        { $match: { status: 'ACTIVE', ...(deptGroupIds.length > 0 ? { faculty_group_id: { $in: deptGroupIds } } : {}) } },
        {
            $project: {
                faculty_group_id: 1, subject_id: 1,
                total: { $size: { $ifNull: ['$syllabus_topics', []] } },
                done: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$syllabus_topics', []] }, as: 't',
                            cond: { $eq: ['$$t.completion_status', 'DONE'] }
                        }
                    }
                },
                missed: {
                    $size: {
                        $filter: {
                            input: { $ifNull: ['$syllabus_topics', []] }, as: 't',
                            cond: { $eq: ['$$t.completion_status', 'MISSED'] }
                        }
                    }
                },
            }
        },
        {
            $addFields: {
                progress: {
                    $cond: [{ $gt: ['$total', 0] }, { $multiply: [{ $divide: ['$done', '$total'] }, 100] }, 0]
                }
            }
        }
    ]);

    const avgProgress = planAgg.length > 0
        ? Math.round(planAgg.reduce((s, p) => s + p.progress, 0) / planAgg.length) : 0;
    const totalDone = planAgg.reduce((s, p) => s + p.done, 0);
    const totalMissed = planAgg.reduce((s, p) => s + p.missed, 0);
    const totalPending = planAgg.reduce((s, p) => s + (p.total - p.done - p.missed), 0);    // Groups with proper year/semester fields
    const groups = await FacultyGroup.find(deptFilter)
        .populate('faculty_ids', 'name')
        .populate('department_id', 'name')
        .select('name year semester section department_id faculty_ids')
        .lean();

    // Year breakdown using schema field (not name parsing)
    const yearBuckets: Record<number, { progresses: number[], groupCount: number }> = {
        1: { progresses: [], groupCount: 0 },
        2: { progresses: [], groupCount: 0 },
        3: { progresses: [], groupCount: 0 },
        4: { progresses: [], groupCount: 0 },
    };

    groups.forEach((g: any) => {
        const yr = g.year || 1;
        if (yearBuckets[yr]) yearBuckets[yr].groupCount++;
    });

    planAgg.forEach((plan: any) => {
        const group = groups.find(g => g._id.toString() === plan.faculty_group_id?.toString()) as any;
        if (group) {
            const yr = group.year || 1;
            if (yearBuckets[yr]) yearBuckets[yr].progresses.push(plan.progress);
        }
    });

    const yearData = Object.entries(yearBuckets).map(([yr, data]) => ({
        name: `Year ${yr}`,
        year: parseInt(yr),
        progress: data.progresses.length > 0
            ? Math.round(data.progresses.reduce((s, p) => s + p, 0) / data.progresses.length) : 0,
        groups: data.groupCount,
        active: data.progresses.length > 0,
    }));

    // Semester progress chart (semi-arch view)
    const semBuckets: Record<number, number[]> = {};
    for (let i = 1; i <= 8; i++) semBuckets[i] = [];
    planAgg.forEach((plan: any) => {
        const group = groups.find(g => g._id.toString() === plan.faculty_group_id?.toString()) as any;
        if (group) {
            const sem = group.semester || 1;
            if (semBuckets[sem]) semBuckets[sem].push(plan.progress);
        }
    });
    const semesterData = Object.entries(semBuckets).map(([sem, progs]) => ({
        name: `S${sem}`,
        semester: parseInt(sem),
        progress: progs.length > 0 ? Math.round(progs.reduce((s, p) => s + p, 0) / progs.length) : 0,
        active: progs.length > 0,
    })).filter(s => s.active);

    // Topic status for donut
    const topicStatusData = [
        { name: 'Completed', value: totalDone, color: '#10b981' },
        { name: 'Missed', value: totalMissed, color: '#ef4444' },
        { name: 'Pending', value: totalPending, color: '#e2e8f0' },
    ];

    // Per-class progress
    const classProgress = groups.slice(0, 10).map((g: any) => {
        const plan = planAgg.find(p => p.faculty_group_id?.toString() === g._id.toString());
        return {
            name: g.name,
            year: g.year || 1,
            semester: g.semester || 1,
            section: g.section || '',
            department: (g.department_id as any)?.name || 'N/A',
            progress: Math.round(plan?.progress || 0),
        };
    }).sort((a, b) => b.progress - a.progress);    // Recent active plans
    const recentPlans = await Plan.find({
        status: 'ACTIVE',
        ...(deptGroupIds.length > 0 ? { faculty_group_id: { $in: deptGroupIds } } : {})
    })
        .populate('faculty_group_id', 'name year semester')
        .populate('subject_id', 'name')
        .sort({ updatedAt: -1 }).limit(5).lean();

    // Faculty underperformance: aggregate missed topics per faculty (dept-scoped)
    const UNDERPERFORM_THRESHOLD = 0.30; // 30% miss rate
    const MIN_MARKED = 5; // minimum topics marked before flagging

    const perFacultyStats = await Plan.aggregate([
        { $match: { status: 'ACTIVE', ...(deptGroupIds.length > 0 ? { faculty_group_id: { $in: deptGroupIds } } : {}) } },
        { $unwind: '$syllabus_topics' },
        { $match: { 'syllabus_topics.completion_status': { $in: ['DONE', 'MISSED'] } } },
        {
            $group: {
                _id: '$syllabus_topics.assigned_faculty_id',
                done: { $sum: { $cond: [{ $eq: ['$syllabus_topics.completion_status', 'DONE'] }, 1, 0] } },
                missed: { $sum: { $cond: [{ $eq: ['$syllabus_topics.completion_status', 'MISSED'] }, 1, 0] } },
                topMissedReason: { $first: '$syllabus_topics.missed_reason' },
            }
        },
        { $match: { _id: { $ne: null } } }
    ]);

    const facultyIds = await User.find({ role: 'FACULTY', isActive: true, ...deptFilter }).select('_id name email').lean();

    // Build underperforming faculty list
    const underperformingFaculty: any[] = [];
    perFacultyStats.forEach((stat: any) => {
        const total = stat.done + stat.missed;
        if (total < MIN_MARKED) return;
        const missRate = stat.missed / total;
        if (missRate <= UNDERPERFORM_THRESHOLD) return;
        const faculty = facultyIds.find((f: any) => f._id.toString() === stat._id?.toString());
        if (!faculty) return;
        underperformingFaculty.push({
            _id: faculty._id,
            name: (faculty as any).name,
            email: (faculty as any).email,
            done: stat.done,
            missed: stat.missed,
            missRate: Math.round(missRate * 100),
            topMissedReason: stat.topMissedReason,
        });
    });
    underperformingFaculty.sort((a, b) => b.missRate - a.missRate);

    return {
        facultyCount, studentCount, subjectCount, facultyGroupCount,
        avgProgress, totalDone, totalMissed, totalPending,
        recentFaculty: JSON.parse(JSON.stringify(recentFaculty)),
        yearData, semesterData, topicStatusData, classProgress,
        recentPlans: JSON.parse(JSON.stringify(recentPlans)),
        activePlanCount: planAgg.length,
        underperformingFaculty: JSON.parse(JSON.stringify(underperformingFaculty)),
    };
}


export default async function HODDashboard() {    const {
        facultyCount, studentCount, subjectCount, facultyGroupCount,
        avgProgress, totalDone, totalMissed, totalPending,
        recentFaculty, yearData, semesterData, topicStatusData, classProgress,
        recentPlans, activePlanCount, underperformingFaculty
    } = await getDashboardStats();

    return (
        <DashboardLayout role="HOD">
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Department Overview</h1>                        <p className="text-muted-foreground text-sm mt-1">
                            {facultyCount} faculty · {studentCount} students · {facultyGroupCount} groups · {activePlanCount} active plans
                        </p>
                    </div>
                    <Badge className="bg-emerald-500/10 text-emerald-600 border-emerald-200 text-xs font-black px-4 py-2">
                        <Activity className="w-3 h-3 mr-2" /> Live Academic Session
                    </Badge>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard label="Faculty Members" value={facultyCount} icon={Users} href="/admin/users" color="blue" delta="+2 this month" />
                    <KPICard label="Subjects" value={subjectCount} icon={BookOpen} href="/admin/subjects" color="emerald" delta="In curriculum" />
                    <KPICard label="Faculty Groups" value={facultyGroupCount} icon={Layers} href="/admin/faculty" color="violet" delta="Across all years" />
                    <KPICard label="Avg Progress" value={`${avgProgress}%`} icon={Target} href="/admin/planner" color="amber" delta={`${totalDone} topics done`} />
                </div>

                {/* Charts Row 1 */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Year-wise Progress Bar Chart */}
                    <Card className="lg:col-span-2 rounded-3xl border-border/60 shadow-sm hover:shadow-lg transition-all">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-lg font-black uppercase tracking-tight">Year-wise Progress</CardTitle>
                                    <CardDescription>Average syllabus completion per academic year</CardDescription>
                                </div>
                                <BarChart3 className="w-5 h-5 text-muted-foreground/40" />
                            </div>
                        </CardHeader>
                        <CardContent>
                            <AnalyticsChart
                                data={yearData}
                                xKey="name"
                                yKey="progress"
                                type="bar"
                                colors={['#2563eb', '#8b5cf6', '#10b981', '#f59e0b']}
                                height={220}
                                unit="%"
                            />
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {yearData.map(y => (
                                    <div key={y.year} className={cn(
                                        "text-center p-2 rounded-xl border text-xs transition-all",
                                        y.active ? "bg-primary/5 border-primary/20 text-primary" : "bg-muted/30 border-border/40 text-muted-foreground/50"
                                    )}>
                                        <div className="font-black text-lg">{y.active ? `${y.progress}%` : '—'}</div>
                                        <div className="text-[10px] font-bold uppercase tracking-widest">Year {y.year}</div>
                                        <div className="text-[9px] opacity-60">{y.groups} group{y.groups !== 1 ? 's' : ''}</div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Topic Status Donut */}
                    <Card className="rounded-3xl border-border/60 shadow-sm hover:shadow-lg transition-all">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Topic Status</CardTitle>
                            <CardDescription>Distribution across all active plans</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnalyticsChart
                                data={topicStatusData}
                                type="donut"
                                nameKey="name"
                                valueKey="value"
                                height={180}
                                showLegend={true}
                            />
                            <div className="space-y-2 mt-4">
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="flex items-center gap-2"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Done</span>
                                    <span className="text-emerald-600 font-black">{totalDone}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="flex items-center gap-2"><XCircle className="w-3.5 h-3.5 text-rose-500" /> Missed</span>
                                    <span className="text-rose-600 font-black">{totalMissed}</span>
                                </div>
                                <div className="flex items-center justify-between text-xs font-bold">
                                    <span className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-slate-400" /> Pending</span>
                                    <span className="text-slate-500 font-black">{totalPending}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Charts Row 2 */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                    {/* Semester-wise area chart */}
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Semester Trend</CardTitle>
                            <CardDescription>Progress across active semesters</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {semesterData.length > 0 ? (
                                <AnalyticsChart
                                    data={semesterData}
                                    xKey="name"
                                    yKey="progress"
                                    type="area"
                                    color="#8b5cf6"
                                    height={200}
                                    unit="%"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-48 text-muted-foreground text-sm font-bold">
                                    No semester data — assign groups to semesters first.
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Class-wise Progress */}
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>                            <CardTitle className="text-lg font-black uppercase tracking-tight">Group Progress</CardTitle>
                                <CardDescription>Per-class completion ranking</CardDescription>
                            </div>
                            <Link href="/admin/faculty">
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase tracking-widest text-primary">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            {classProgress.length > 0 ? (
                                <div className="space-y-3">
                                    {classProgress.slice(0, 6).map((cp: any, idx: number) => (
                                        <div key={idx} className="space-y-1">
                                            <div className="flex justify-between items-center">
                                                <div>
                                                    <span className="text-xs font-black text-foreground">{cp.name}</span>
                                                    <span className="ml-2 text-[10px] font-bold text-muted-foreground">
                                                        Y{cp.year} · S{cp.semester}{cp.section ? ` · ${cp.section}` : ''}
                                                    </span>
                                                </div>
                                                <span className={cn("text-[10px] font-black", cp.progress >= 70 ? "text-emerald-600" : cp.progress >= 40 ? "text-amber-600" : "text-rose-500")}>
                                                    {cp.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full transition-all duration-700", cp.progress >= 70 ? "bg-emerald-500" : cp.progress >= 40 ? "bg-amber-500" : "bg-rose-400")}
                                                    style={{ width: `${cp.progress}%` }}
                                                />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-muted-foreground text-center py-8 font-medium italic">
                                    No active plans found. Generate plans via the Academic Planner.
                                </p>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Bottom Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Recent Faculty */}
                    <Card className="rounded-3xl border-border/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black uppercase tracking-tight opacity-70">Recent Faculty</CardTitle>
                            <Link href="/admin/users"><Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">All</Button></Link>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {recentFaculty.map((fac: any) => (
                                <Link key={fac._id} href={`/dashboard/hod/faculty/${fac._id}`}
                                    className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-muted/50 transition-all group">
                                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-black text-sm">
                                        {fac.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-foreground truncate">{fac.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-wide">{fac.email}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Active Plans Feed */}
                    <Card className="rounded-3xl border-border/60 shadow-sm lg:col-span-2">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black uppercase tracking-tight opacity-70">Active Plans</CardTitle>
                            <Link href="/admin/planner"><Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-primary">Planner</Button></Link>
                        </CardHeader>
                        <CardContent>
                            {recentPlans.length > 0 ? (
                                <div className="space-y-3">
                                    {recentPlans.map((plan: any, idx: number) => {
                                        const total = plan.syllabus_topics?.length || 0;
                                        const done = plan.syllabus_topics?.filter((t: any) => t.completion_status === 'DONE').length || 0;
                                        const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                                        return (
                                            <div key={idx} className="flex items-center gap-4 p-3 rounded-2xl bg-muted/30 border border-border/40">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <span className="text-sm font-black text-foreground truncate">{plan.subject_id?.name || 'Untitled'}</span>
                                                        <Badge className="text-[9px] font-black bg-primary/10 text-primary border-0">
                                                            Y{plan.faculty_group_id?.year} · S{plan.faculty_group_id?.semester}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{plan.faculty_group_id?.name}</p>
                                                    <div className="w-full h-1 bg-muted rounded-full mt-1.5">
                                                        <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-400")}
                                                            style={{ width: `${pct}%` }} />
                                                    </div>
                                                </div>
                                                <span className="text-sm font-black text-primary shrink-0">{pct}%</span>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="text-center py-10 text-muted-foreground">
                                    <Flame className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm font-bold">No active plans yet.</p>
                                    <p className="text-xs mt-1">Use the Academic Planner to generate AI-powered schedules.</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>                {/* Faculty Underperformance Alert */}
                {underperformingFaculty.length > 0 && (
                    <Card className="rounded-3xl border-rose-200 bg-rose-50/30 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center">
                                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                                </div>
                                <div>
                                    <CardTitle className="text-base font-black uppercase tracking-tight text-rose-700">
                                        Faculty Underperformance Alert
                                    </CardTitle>
                                    <CardDescription className="text-rose-500 text-xs font-bold mt-0.5">
                                        {underperformingFaculty.length} faculty member{underperformingFaculty.length !== 1 ? 's' : ''} with &gt;30% miss rate (min. 5 marked topics)
                                    </CardDescription>
                                </div>
                            </div>
                            <Link href="/admin/users">
                                <Button variant="ghost" size="sm" className="text-[10px] font-black uppercase text-rose-600 hover:bg-rose-100">View All</Button>
                            </Link>
                        </CardHeader>
                        <CardContent className="pt-0">
                            <div className="space-y-3">
                                {underperformingFaculty.map((fac: any) => (
                                    <Link key={fac._id} href={`/dashboard/hod/faculty/${fac._id}`}>
                                        <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-rose-100 hover:border-rose-300 hover:shadow-md transition-all group">
                                            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center font-black text-sm shrink-0">
                                                {fac.name.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-black text-slate-900 truncate">{fac.name}</p>
                                                    <Badge className="bg-rose-100 text-rose-700 border-rose-200 text-[9px] font-black px-2 py-0.5 flex items-center gap-1">
                                                        <TrendingDown className="w-3 h-3" />{fac.missRate}% missed
                                                    </Badge>
                                                </div>
                                                <div className="flex items-center gap-3 mt-1">
                                                    <span className="text-[10px] text-slate-500 font-bold">{fac.done} done · {fac.missed} missed</span>
                                                    {fac.topMissedReason && (
                                                        <span className="text-[10px] text-rose-500 font-bold">
                                                            Top reason: {MISSED_REASON_LABELS[fac.topMissedReason] || fac.topMissedReason}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="w-full h-1.5 bg-rose-100 rounded-full mt-2 overflow-hidden">
                                                    <div
                                                        className="h-full bg-rose-500 rounded-full transition-all duration-700"
                                                        style={{ width: `${fac.missRate}%` }}
                                                    />
                                                </div>
                                            </div>
                                            <ChevronRight className="w-4 h-4 text-rose-300 group-hover:translate-x-0.5 transition-all shrink-0" />
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Quick Links */}
                <Card className="bg-secondary text-secondary-foreground border-none shadow-xl rounded-3xl">
                    <CardHeader>
                        <CardTitle className="text-secondary-foreground font-black uppercase tracking-tight">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {[
                            { label: 'Academic Planner', href: '/admin/planner', desc: 'AI-powered scheduling' },
                            { label: 'Timetable Editor', href: '/admin/timetable', desc: 'Weekly slot allocation' },
                            { label: 'Syllabus Registry', href: '/admin/subjects', desc: 'Manage curricula' },
                            { label: 'User Management', href: '/admin/users', desc: 'Faculty & students' },
                        ].map(item => (
                            <Link key={item.href} href={item.href}
                                className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all group border border-white/5 hover:border-white/20">
                                <div>
                                    <p className="text-sm font-black uppercase tracking-tight">{item.label}</p>
                                    <p className="text-[10px] text-white/50 font-bold mt-0.5">{item.desc}</p>
                                </div>
                                <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
                            </Link>
                        ))}
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}

function KPICard({ label, value, icon: Icon, href, color, delta }: any) {
    const colors: any = {
        blue: { bg: 'bg-blue-500/10', text: 'text-blue-600', icon: 'group-hover:bg-blue-600', border: 'border-blue-200/60' },
        emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', icon: 'group-hover:bg-emerald-600', border: 'border-emerald-200/60' },
        violet: { bg: 'bg-violet-500/10', text: 'text-violet-600', icon: 'group-hover:bg-violet-600', border: 'border-violet-200/60' },
        amber: { bg: 'bg-amber-500/10', text: 'text-amber-600', icon: 'group-hover:bg-amber-600', border: 'border-amber-200/60' },
    };
    const c = colors[color] || colors.blue;

    return (
        <Link href={href} className="block transition-transform hover:-translate-y-1">
            <Card className={cn("hover:shadow-xl transition-all duration-300 border group rounded-2xl overflow-hidden", c.border)}>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300", c.bg, c.icon, "group-hover:text-white")}>
                            <Icon className={cn("w-4 h-4", c.text, "group-hover:text-white transition-colors")} />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1 opacity-60">{delta}</p>
                </CardContent>
            </Card>
        </Link>
    );
}
