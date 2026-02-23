import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const user = await User.findById(id).lean();
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // 1. Find groups where this user is a member (Case-insensitive)
        const groups = await FacultyGroup.find({
            $or: [
                { members: { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Monday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Tuesday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Wednesday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Thursday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Friday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Saturday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } },
                { "timetable.Sunday.faculty": { $regex: new RegExp(`^${user.name}$`, 'i') } }
            ]
        }).lean();

        // 2. Identify subjects assigned to this faculty across groups
        const subjectAssignments: { groupId: string; groupName: string; subject: string }[] = [];

        groups.forEach((group: any) => {
            const groupSubjects = new Set<string>();
            // Check timetable for subjects assigned to this faculty
            if (group.timetable) {
                Object.values(group.timetable).forEach((slots: any) => {
                    slots.forEach((slot: any) => {
                        if (slot.faculty && slot.faculty.toLowerCase() === user.name.toLowerCase() && slot.subject) {
                            groupSubjects.add(slot.subject);
                        }
                    });
                });
            }

            groupSubjects.forEach(sub => {
                subjectAssignments.push({
                    groupId: group._id.toString(),
                    groupName: group.name,
                    subject: sub
                });
            });
        });

        // 3. Fetch Plans for these assignments
        const plans = await Plan.find({
            $or: subjectAssignments.map(a => ({
                faculty_id: a.groupId,
                subject: a.subject,
                status: 'ACTIVE'
            }))
        }).lean();

        // 4. Aggregate stats for "Hits and Misses"
        let totalHits = 0;
        let totalMisses = 0;
        let totalPending = 0;
        const allTopics: any[] = [];

        plans.forEach((plan: any) => {
            plan.syllabus_topics.forEach((topic: any) => {
                if (topic.completion_status === 'DONE') totalHits++;
                else if (topic.completion_status === 'MISSED') totalMisses++;
                else totalPending++;

                allTopics.push({
                    ...topic,
                    subject: plan.subject,
                    groupName: groups.find(g => g._id.toString() === plan.faculty_id.toString())?.name ||
                        groups.find(g => String(g._id) === String(plan.faculty_id))?.name ||
                        'Unknown'
                });
            });
        });

        return NextResponse.json({
            success: true,
            user,
            groups: groups.map(g => ({ _id: g._id, name: g.name })),
            subjectAssignments,
            stats: {
                hits: totalHits,
                misses: totalMisses,
                pending: totalPending
            },
            topics: allTopics.sort((a, b) => new Date(a.scheduled_date || 0).getTime() - new Date(b.scheduled_date || 0).getTime())
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
