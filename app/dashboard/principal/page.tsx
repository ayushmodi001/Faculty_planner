import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import DashboardLayout from '@/components/layout/DashboardLayout';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import Plan from '@/models/Plan';
import FacultyGroup from '@/models/FacultyGroup';
import Department from '@/models/Department';
import { cn } from '@/lib/utils';
import DepartmentManager from '@/components/admin/DepartmentManager';
import { AnalyticsChart } from '@/components/dashboard/AnalyticsChart';
import {
    ArrowRight, GraduationCap, Users, TrendingUp, Building2,
    CheckCircle2, ChevronRight, Layers, Activity, BarChart3,
    XCircle, Clock, Target, Network, AlertTriangle
} from 'lucide-react';

export const dynamic = 'force-dynamic';

async function getPrincipalStats() {
    await dbConnect();
    await import('@/models/Subject');
    await import('@/models/User');

    const [facultyCount, studentCount, hodCount, subjectCount] = await Promise.all([
        User.countDocuments({ role: 'FACULTY', isActive: true }),
        User.countDocuments({ role: 'STUDENT', isActive: true }),
        User.countDocuments({ role: 'HOD', isActive: true }),
        Subject.countDocuments(),
    ]);

    const recentFaculty = await User.find({ role: 'FACULTY' })
        .sort({ createdAt: -1 }).limit(5)
        .select('name email createdAt').lean();

    // Plan aggregation
    const planAgg = await Plan.aggregate([
        { $match: { status: 'ACTIVE' } },
        {
            $project: {
                faculty_group_id: 1, department_id: 1,
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
    const totalPending = planAgg.reduce((s, p) => s + (p.total - p.done - p.missed), 0);

    // Departments + Groups
    const depts = await Department.find().sort({ name: 1 }).select('name hod_id').lean();
    const groups = await FacultyGroup.find()
        .populate('department_id', 'name')
        .select('name year semester section department_id faculty_ids')
        .lean();

    // Department performance
    const departmentData = depts.map((dept: any) => {
        const deptGroups = groups.filter((g: any) => {
            const dId = (g.department_id as any)?._id?.toString() || g.department_id?.toString();
            return dId === dept._id.toString();
        });
        const deptGroupIds = new Set(deptGroups.map((g: any) => g._id.toString()));
        const deptPlans = planAgg.filter(p => deptGroupIds.has(p.faculty_group_id?.toString()));
        const deptProgress = deptPlans.length > 0
            ? Math.round(deptPlans.reduce((s, p) => s + p.progress, 0) / deptPlans.length) : 0;
        const deptFaculty = deptGroups.reduce((s: number, g: any) => s + (g.faculty_ids?.length || 0), 0);
        const deptDone = deptPlans.reduce((s, p) => s + p.done, 0);
        const deptMissed = deptPlans.reduce((s, p) => s + p.missed, 0);

        return {
            name: dept.name.length > 14 ? dept.name.slice(0, 14) + '..' : dept.name,
            fullName: dept.name,
            progress: deptProgress,
            groups: deptGroups.length,
            plans: deptPlans.length,
            faculty: deptFaculty,
            done: deptDone,
            missed: deptMissed,
            onTrack: deptProgress >= 50,
        };
    });

    // Year data (institution-wide)
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

    // Topic status donut
    const topicStatusData = [
        { name: 'Completed', value: totalDone, color: '#10b981' },
        { name: 'Missed', value: totalMissed, color: '#ef4444' },
        { name: 'Pending', value: totalPending, color: '#e2e8f0' },
    ];

    // Recent plans
    const recentPlans = await Plan.find({ status: 'ACTIVE' })
        .populate('faculty_group_id', 'name year semester')
        .populate('subject_id', 'name')
        .sort({ updatedAt: -1 }).limit(6).lean();

    return {
        facultyCount, studentCount, hodCount, subjectCount,
        totalUsers: hodCount + facultyCount + studentCount,
        avgProgress, totalDone, totalMissed, totalPending,
        recentFaculty: JSON.parse(JSON.stringify(recentFaculty)),
        departmentData, yearData, topicStatusData,
        departmentCount: depts.length,
        totalGroups: groups.length,
        activePlanCount: planAgg.length,
        actualDepartments: JSON.parse(JSON.stringify(depts)),
        recentPlans: JSON.parse(JSON.stringify(recentPlans)),
    };
}

export default async function PrincipalDashboard() {
    const {
        facultyCount, studentCount, hodCount, subjectCount, totalUsers,
        avgProgress, totalDone, totalMissed, totalPending,
        recentFaculty, departmentData, yearData, topicStatusData,
        departmentCount, totalGroups, activePlanCount,
        actualDepartments, recentPlans,
    } = await getPrincipalStats();

    return (
        <DashboardLayout role="Principal">
            <div className="space-y-6 animate-in fade-in duration-500">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Institutional Overview</h1>
                        <p className="text-muted-foreground text-sm mt-1 uppercase tracking-widest font-black opacity-60">
                            Principal Dashboard · Academic Session 2025–26
                        </p>
                    </div>
                    <Badge className="bg-primary/10 text-primary border-primary/20 text-xs font-black px-4 py-2">
                        <Activity className="w-3 h-3 mr-2 inline" /> {activePlanCount} Active Plans
                    </Badge>
                </div>

                {/* KPI Row */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    <KPICard label="Total Personnel" value={totalUsers} icon={Users} href="/admin/users" color="blue"
                        delta={`${facultyCount} faculty · ${studentCount} students`} />
                    <KPICard label="Departments" value={departmentCount} icon={Building2} href="#departments" color="emerald"
                        delta={`${hodCount} HODs assigned`} />
                    <KPICard label="Faculty Groups" value={totalGroups} icon={Layers} href="/admin/faculty" color="violet"
                        delta="Active class groups" />
                    <KPICard label="Avg. Progress" value={`${avgProgress}%`} icon={Target} href="/admin/planner" color="amber"
                        delta={`${totalDone} topics completed`} />
                </div>

                {/* Institutional Progress + Topic Donut */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Institution-wide progress gauage + year breakdown */}
                    <Card className="lg:col-span-2 rounded-3xl border-border/60 shadow-sm hover:shadow-lg transition-all">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div>
                                    <CardTitle className="text-xl font-black uppercase tracking-tight">Syllabus Synchronization</CardTitle>
                                    <CardDescription>Institution-wide completion across all years</CardDescription>
                                </div>
                                <Badge className="bg-primary/10 text-primary border-0 font-black text-[10px] uppercase tracking-widest">
                                    Institutional Metric
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center gap-10 mb-6">
                                {/* Circular gauge */}
                                <div className="relative w-32 h-32 shrink-0">
                                    <svg className="w-full h-full -rotate-90">
                                        <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="10" fill="transparent" className="text-muted/20" />
                                        <circle
                                            cx="64" cy="64" r="56"
                                            stroke="currentColor" strokeWidth="10" fill="transparent"
                                            strokeDasharray={351.9}
                                            strokeDashoffset={351.9 * (1 - avgProgress / 100)}
                                            className="text-primary transition-all duration-1000"
                                            strokeLinecap="round"
                                        />
                                    </svg>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-2xl font-black">{avgProgress}%</span>
                                        <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Overall</span>
                                    </div>
                                </div>
                                <div className="flex-1 grid grid-cols-2 gap-3">
                                    <MetricPill icon={CheckCircle2} label="Topics Done" value={totalDone} color="emerald" />
                                    <MetricPill icon={XCircle} label="Missed" value={totalMissed} color="rose" />
                                    <MetricPill icon={Clock} label="Pending" value={totalPending} color="slate" />
                                    <MetricPill icon={Network} label="Plans Active" value={activePlanCount} color="blue" />
                                </div>
                            </div>
                            <AnalyticsChart
                                data={yearData}
                                xKey="name" yKey="progress"
                                type="bar"
                                colors={['#2563eb', '#8b5cf6', '#10b981', '#f59e0b']}
                                height={180} unit="%"
                            />
                        </CardContent>
                    </Card>

                    {/* Topic Donut */}
                    <Card className="rounded-3xl border-border/60 shadow-sm hover:shadow-lg transition-all">
                        <CardHeader>
                            <CardTitle className="text-lg font-black uppercase tracking-tight">Topic Breakdown</CardTitle>
                            <CardDescription>All plans combined</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <AnalyticsChart
                                data={topicStatusData} type="donut"
                                nameKey="name" valueKey="value"
                                height={200} showLegend={true}
                            />
                            <div className="mt-4 space-y-2 text-xs font-bold">
                                <div className="flex justify-between">
                                    <span className="text-emerald-600">✓ Completed</span>
                                    <span className="font-black">{totalDone}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-rose-500">✗ Missed</span>
                                    <span className="font-black">{totalMissed}</span>
                                </div>
                                <div className="flex justify-between text-muted-foreground">
                                    <span>◷ Pending</span>
                                    <span className="font-black">{totalPending}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Department Performance Chart */}
                <Card className="rounded-3xl border-border/60 shadow-sm" id="departments-chart">
                    <CardHeader>
                        <div className="flex items-center justify-between">
                            <div>
                                <CardTitle className="text-xl font-black uppercase tracking-tight">Departmental Analytics</CardTitle>
                                <CardDescription>Syllabus completion per department</CardDescription>
                            </div>
                            <BarChart3 className="w-5 h-5 text-muted-foreground/40" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        {departmentData.length > 0 ? (
                            <>
                                <AnalyticsChart
                                    data={departmentData}
                                    xKey="name" yKey="progress"
                                    type="bar"
                                    colors={['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4']}
                                    height={250} unit="%"
                                />
                                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                    {departmentData.map((dept: any) => (
                                        <div key={dept.fullName} className={cn(
                                            "p-4 rounded-2xl border transition-all",
                                            dept.onTrack ? "bg-emerald-50/50 border-emerald-200/60" : "bg-rose-50/50 border-rose-200/60"
                                        )}>
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <p className="text-sm font-black text-foreground">{dept.fullName}</p>
                                                    <p className="text-[10px] text-muted-foreground font-bold mt-0.5">
                                                        {dept.groups} group{dept.groups !== 1 ? 's' : ''} · {dept.faculty} faculty
                                                    </p>
                                                </div>
                                                <span className={cn("text-lg font-black", dept.onTrack ? "text-emerald-600" : "text-rose-500")}>
                                                    {dept.progress}%
                                                </span>
                                            </div>
                                            <div className="w-full h-1.5 bg-white/60 rounded-full mt-2 overflow-hidden">
                                                <div
                                                    className={cn("h-full rounded-full", dept.onTrack ? "bg-emerald-500" : "bg-rose-400")}
                                                    style={{ width: `${dept.progress}%` }}
                                                />
                                            </div>
                                            <div className="flex gap-3 mt-2 text-[10px] font-bold">
                                                <span className="text-emerald-600">✓ {dept.done}</span>
                                                <span className="text-rose-500">✗ {dept.missed}</span>
                                                {!dept.onTrack && (
                                                    <span className="text-amber-600 flex items-center gap-1">
                                                        <AlertTriangle className="w-3 h-3" /> Below 50%
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12 text-muted-foreground">
                                <Building2 className="w-12 h-12 mx-auto mb-3 opacity-20" />
                                <p className="font-bold">No departments found.</p>
                                <p className="text-sm mt-1">Add departments below to see analytics.</p>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Bottom Row */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Recent Faculty */}
                    <Card className="lg:col-span-4 rounded-3xl border-border/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black uppercase tracking-tight opacity-70">Recent Faculty</CardTitle>
                            <Link href="/admin/users"><Button variant="ghost" size="sm" className="text-[10px] font-black text-primary">Registry</Button></Link>
                        </CardHeader>
                        <CardContent className="space-y-2">                        {recentFaculty.map((fac: any) => (
                                <Link key={fac._id} href={`/dashboard/hod/faculty/${fac._id}`}
                                    className="flex items-center gap-3 p-3 rounded-2xl hover:bg-muted/40 transition-all group">
                                    <div className="w-10 h-10 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center font-black text-sm">
                                        {fac.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-black">{fac.name}</p>
                                        <p className="text-[10px] text-muted-foreground font-bold opacity-60 truncate">{fac.email}</p>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-muted-foreground/30 group-hover:translate-x-0.5 transition-all" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Recent Plan Activity */}
                    <Card className="lg:col-span-5 rounded-3xl border-border/60 shadow-sm">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-black uppercase tracking-tight opacity-70">Active Plans</CardTitle>
                            <Link href="/admin/planner"><Button variant="ghost" size="sm" className="text-[10px] font-black text-primary">Master Scheduler</Button></Link>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {recentPlans.length > 0 ? recentPlans.map((plan: any, idx: number) => {
                                const total = plan.syllabus_topics?.length || 0;
                                const done = plan.syllabus_topics?.filter((t: any) => t.completion_status === 'DONE').length || 0;
                                const pct = total > 0 ? Math.round((done / total) * 100) : 0;
                                return (
                                    <div key={idx} className="flex items-center gap-3 p-2.5 rounded-xl bg-muted/30 border border-border/40">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <span className="text-xs font-black truncate">{plan.subject_id?.name}</span>
                                                <Badge className="text-[9px] bg-primary/10 text-primary border-0 font-black">
                                                    Y{plan.faculty_group_id?.year} S{plan.faculty_group_id?.semester}
                                                </Badge>
                                            </div>
                                            <p className="text-[10px] text-muted-foreground font-bold mt-0.5">{plan.faculty_group_id?.name}</p>
                                            <div className="w-full h-1 bg-muted rounded-full mt-1.5">
                                                <div className={cn("h-full rounded-full", pct >= 70 ? "bg-emerald-500" : pct >= 40 ? "bg-amber-500" : "bg-rose-400")}
                                                    style={{ width: `${pct}%` }} />
                                            </div>
                                        </div>
                                        <span className="text-sm font-black text-primary">{pct}%</span>
                                    </div>
                                );
                            }) : (
                                <p className="text-sm text-muted-foreground text-center py-8 italic">No active plans.</p>
                            )}
                        </CardContent>
                    </Card>

                    {/* Admin Actions */}
                    <Card className="lg:col-span-3 bg-primary text-primary-foreground border-none rounded-3xl shadow-2xl">
                        <CardHeader>
                            <CardTitle className="text-primary-foreground font-black uppercase tracking-tight">Lead Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            {[
                                { label: 'Master Scheduler', href: '/admin/planner' },
                                { label: 'Institutional Audit', href: '/admin/users' },
                                { label: 'Calendar Editor', href: '/admin/calendar' },
                                { label: 'Settings', href: '/settings' },
                            ].map(item => (
                                <Link key={item.href} href={item.href}
                                    className="flex items-center justify-between p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 hover:border-white/20 transition-all group">
                                    <p className="text-sm font-black uppercase tracking-tight">{item.label}</p>
                                    <ArrowRight className="w-4 h-4 text-white/30 group-hover:text-white group-hover:translate-x-1 transition-all" />
                                </Link>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Department Manager */}
                <div id="departments">
                    <DepartmentManager initialDepartments={actualDepartments} />
                </div>
            </div>
        </DashboardLayout>
    );
}

function KPICard({ label, value, icon: Icon, href, color, delta }: any) {
    const colors: any = {
        blue: { border: 'border-blue-200/60', icon: 'bg-blue-500/10 text-blue-600', hover: 'group-hover:bg-blue-600' },
        emerald: { border: 'border-emerald-200/60', icon: 'bg-emerald-500/10 text-emerald-600', hover: 'group-hover:bg-emerald-600' },
        violet: { border: 'border-violet-200/60', icon: 'bg-violet-500/10 text-violet-600', hover: 'group-hover:bg-violet-600' },
        amber: { border: 'border-amber-200/60', icon: 'bg-amber-500/10 text-amber-600', hover: 'group-hover:bg-amber-600' },
    };
    const c = colors[color] || colors.blue;
    return (
        <Link href={href} className="block transition-transform hover:-translate-y-1">
            <Card className={cn("hover:shadow-xl transition-all border group rounded-2xl", c.border)}>
                <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-3">
                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{label}</p>
                        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300", c.icon, c.hover, "group-hover:text-white")}>
                            <Icon className="w-4 h-4" />
                        </div>
                    </div>
                    <p className="text-3xl font-black text-foreground tracking-tight">{value}</p>
                    <p className="text-[10px] text-muted-foreground font-bold mt-1 opacity-60">{delta}</p>
                </CardContent>
            </Card>
        </Link>
    );
}

function MetricPill({ icon: Icon, label, value, color }: any) {
    const cls: any = {
        emerald: 'bg-emerald-50 text-emerald-700 border-emerald-100',
        rose: 'bg-rose-50 text-rose-700 border-rose-100',
        blue: 'bg-blue-50 text-blue-700 border-blue-100',
        slate: 'bg-slate-50 text-slate-600 border-slate-100',
    };
    return (
        <div className={cn("flex items-center gap-2 p-2.5 rounded-xl border text-xs font-black", cls[color] || cls.slate)}>
            <Icon className="w-3.5 h-3.5 shrink-0" />
            <div>
                <p className="font-black text-base leading-none">{value}</p>
                <p className="text-[9px] opacity-70 uppercase tracking-wide font-bold">{label}</p>
            </div>
        </div>
    );
}
