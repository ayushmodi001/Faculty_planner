import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';
import mongoose from 'mongoose';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });

        const user = await User.findById(id).lean();
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });        // 1. Find groups where this user is a faculty_ids member (using ObjectId reference)
        const groups = await FacultyGroup.find({ faculty_ids: new mongoose.Types.ObjectId(id) })
            .populate('subjectAssignments.subject_id', 'name')
            .lean();

        // 2. Identify subjects assigned to this faculty from subjectAssignments
        const subjectAssignments: { groupId: string; groupName: string; subject: string }[] = [];

        groups.forEach((group: any) => {
            const groupSubjects = new Set<string>();

            // Check subjectAssignments for subjects mapped to this faculty member
            (group.subjectAssignments || []).forEach((a: any) => {
                const assignedFacultyId = a.faculty_id?.toString();
                if (assignedFacultyId === id && a.subject_id?.name) {
                    groupSubjects.add(a.subject_id.name);
                }
            });

            // Fallback: if no subjectAssignments, include all subjects in the timetable slots
            // that reference this faculty by ObjectId
            if (groupSubjects.size === 0) {
                const timetable = group.timetable instanceof Map
                    ? Object.fromEntries(group.timetable)
                    : (group.timetable || {});
                Object.values(timetable).forEach((slots: any) => {
                    if (!Array.isArray(slots)) return;
                    slots.forEach((slot: any) => {
                        if (slot.faculty_id?.toString() === id && slot.subject_id) {
                            groupSubjects.add(slot.subject_id.toString());
                        }
                    });
                });
            }

            groupSubjects.forEach((sub) => {
                subjectAssignments.push({
                    groupId: group._id.toString(),
                    groupName: group.name,
                    subject: sub,
                });
            });
        });

        // 3. Fetch active Plans for this faculty member
        const plans = await Plan.find({
            faculty_ids: new mongoose.Types.ObjectId(id),
            status: 'ACTIVE',
        })
            .populate('subject_id', 'name')
            .populate('faculty_group_id', 'name')
            .lean();

        // 4. Aggregate stats
        let totalHits = 0;
        let totalMisses = 0;
        let totalPending = 0;
        const allTopics: any[] = [];

        plans.forEach((plan: any) => {
            const subjectName = (plan.subject_id as any)?.name || 'Unknown';
            const groupName = (plan.faculty_group_id as any)?.name || 'Unknown';

            plan.syllabus_topics?.forEach((topic: any) => {
                if (topic.completion_status === 'DONE') totalHits++;
                else if (topic.completion_status === 'MISSED') totalMisses++;
                else totalPending++;                allTopics.push({
                    _id: topic._id,
                    name: topic.name,
                    scheduled_date: topic.scheduled_date,
                    completion_status: topic.completion_status,
                    missed_reason: topic.missed_reason,
                    missed_reason_custom: topic.missed_reason_custom,
                    marked_at: topic.marked_at,
                    priority: topic.priority,
                    subject: subjectName,
                    groupName,
                });
            });
        });

        return NextResponse.json({
            success: true,
            user: JSON.parse(JSON.stringify(user)),
            groups: groups.map((g: any) => ({ _id: g._id, name: g.name })),
            subjectAssignments,
            stats: {
                hits: totalHits,
                misses: totalMisses,
                pending: totalPending,
            },
            topics: allTopics.sort(
                (a, b) =>
                    new Date(a.scheduled_date || 0).getTime() -
                    new Date(b.scheduled_date || 0).getTime()
            ),
        });
    } catch (error: any) {
        console.error('Faculty detail error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
