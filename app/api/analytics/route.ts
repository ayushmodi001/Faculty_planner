import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';
import Department from '@/models/Department';
import { verifyJWT } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
    try {
        // Only PRINCIPAL and ADMIN can access institution-wide analytics
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || (session.role !== 'PRINCIPAL' && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();

        // Import models for population side effects
        await import('@/models/Subject');
        await import('@/models/User');

        // ── 1. Basic Counts ──────────────────────────────────────────────────
        const [facultyCount, studentCount, hodCount, subjectCount, departmentCount, groupCount] =
            await Promise.all([
                User.countDocuments({ role: 'FACULTY', isActive: true }),
                User.countDocuments({ role: 'STUDENT', isActive: true }),
                User.countDocuments({ role: 'HOD', isActive: true }),
                Subject.countDocuments(),
                Department.countDocuments(),
                FacultyGroup.countDocuments(),
            ]);

        // ── 2. Plan Progress Aggregation ─────────────────────────────────────
        const planAgg = await Plan.aggregate([
            { $match: { status: 'ACTIVE' } },
            {
                $project: {
                    faculty_group_id: 1,
                    subject_id: 1,
                    department_id: 1,
                    total: { $size: { $ifNull: ['$syllabus_topics', []] } },
                    done: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ['$syllabus_topics', []] },
                                as: 't',
                                cond: { $eq: ['$$t.completion_status', 'DONE'] },
                            },
                        },
                    },
                    missed: {
                        $size: {
                            $filter: {
                                input: { $ifNull: ['$syllabus_topics', []] },
                                as: 't',
                                cond: { $eq: ['$$t.completion_status', 'MISSED'] },
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    progress: {
                        $cond: [
                            { $gt: ['$total', 0] },
                            { $multiply: [{ $divide: ['$done', '$total'] }, 100] },
                            0,
                        ],
                    },
                },
            },
        ]);

        const activePlanCount = planAgg.length;
        const avgProgress = activePlanCount > 0
            ? Math.round(planAgg.reduce((s, p) => s + p.progress, 0) / activePlanCount)
            : 0;
        const totalDone = planAgg.reduce((s, p) => s + p.done, 0);
        const totalMissed = planAgg.reduce((s, p) => s + p.missed, 0);
        const totalPending = planAgg.reduce((s, p) => s + (p.total - p.done - p.missed), 0);

        // ── 3. Per-year breakdown using the new year field ────────────────────
        const groups = await FacultyGroup.find()
            .populate('department_id', 'name')
            .select('name year semester section department_id')
            .lean();

        const yearBuckets: Record<number, { plans: number[], groupCount: number }> = {
            1: { plans: [], groupCount: 0 },
            2: { plans: [], groupCount: 0 },
            3: { plans: [], groupCount: 0 },
            4: { plans: [], groupCount: 0 },
        };

        groups.forEach((g: any) => {
            const yr = g.year || 1;
            if (yearBuckets[yr]) yearBuckets[yr].groupCount++;
        });

        planAgg.forEach((plan: any) => {
            const group = groups.find(g => g._id.toString() === plan.faculty_group_id?.toString());
            if (group) {
                const yr = (group as any).year || 1;
                if (yearBuckets[yr]) {
                    yearBuckets[yr].plans.push(plan.progress);
                }
            }
        });

        const yearData = Object.entries(yearBuckets).map(([yr, data]) => ({
            name: `Year ${yr}`,
            year: parseInt(yr),
            progress: data.plans.length > 0
                ? Math.round(data.plans.reduce((s, p) => s + p, 0) / data.plans.length)
                : 0,
            groups: data.groupCount,
            active: data.plans.length > 0,
        }));

        // ── 4. Per-semester breakdown ─────────────────────────────────────────
        const semesterBuckets: Record<number, number[]> = {};
        for (let i = 1; i <= 8; i++) semesterBuckets[i] = [];

        planAgg.forEach((plan: any) => {
            const group = groups.find(g => g._id.toString() === plan.faculty_group_id?.toString());
            if (group) {
                const sem = (group as any).semester || 1;
                if (semesterBuckets[sem]) semesterBuckets[sem].push(plan.progress);
            }
        });

        const semesterData = Object.entries(semesterBuckets).map(([sem, progs]) => ({
            name: `Sem ${sem}`,
            semester: parseInt(sem),
            progress: progs.length > 0 ? Math.round(progs.reduce((s, p) => s + p, 0) / progs.length) : 0,
            active: progs.length > 0,
        }));

        // ── 5. Per-department breakdown ────────────────────────────────────────
        const depts = await Department.find().select('name').lean();
        const departmentData = depts.map((dept: any) => {
            const deptGroups = groups.filter((g: any) => {
                const deptId = (g.department_id as any)?._id?.toString() || g.department_id?.toString();
                return deptId === dept._id.toString();
            });
            const deptGroupIds = new Set(deptGroups.map((g: any) => g._id.toString()));
            const deptPlans = planAgg.filter(p => deptGroupIds.has(p.faculty_group_id?.toString()));
            const deptProgress = deptPlans.length > 0
                ? Math.round(deptPlans.reduce((s, p) => s + p.progress, 0) / deptPlans.length)
                : 0;

            return {
                name: dept.name.length > 12 ? dept.name.slice(0, 12) + '..' : dept.name,
                fullName: dept.name,
                progress: deptProgress,
                groups: deptGroups.length,
                plans: deptPlans.length,
                done: deptPlans.reduce((s, p) => s + p.done, 0),
                missed: deptPlans.reduce((s, p) => s + p.missed, 0),
                onTrack: deptProgress >= 50,
            };
        });

        // ── 6. Topic status donut data ─────────────────────────────────────────
        const topicStatusData = [
            { name: 'Done', value: totalDone, color: '#10b981' },
            { name: 'Missed', value: totalMissed, color: '#ef4444' },
            { name: 'Pending', value: totalPending, color: '#94a3b8' },
        ];

        // ── 7. Recent Plans ─────────────────────────────────────────────────────
        const recentPlans = await Plan.find({ status: 'ACTIVE' })
            .populate('faculty_group_id', 'name year semester')
            .populate('subject_id', 'name')
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentPlanData = recentPlans.map((p: any) => ({
            groupName: p.faculty_group_id?.name || 'Unknown',
            year: p.faculty_group_id?.year || '?',
            semester: p.faculty_group_id?.semester || '?',
            subject: p.subject_id?.name || 'Unknown',
            progress: p.syllabus_topics?.length > 0
                ? Math.round((p.syllabus_topics.filter((t: any) => t.completion_status === 'DONE').length / p.syllabus_topics.length) * 100)
                : 0,
            totalTopics: p.syllabus_topics?.length || 0,
        }));

        return NextResponse.json({
            success: true,
            counts: { facultyCount, studentCount, hodCount, subjectCount, departmentCount, groupCount, activePlanCount },
            metrics: { avgProgress, totalDone, totalMissed, totalPending },
            yearData,
            semesterData,
            departmentData,
            topicStatusData,
            recentPlans: recentPlanData,
        });
    } catch (error: any) {
        console.error('[Analytics API Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
