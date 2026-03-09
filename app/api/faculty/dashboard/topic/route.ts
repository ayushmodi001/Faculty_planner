import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Plan, { ITopic, IPlan } from '@/models/Plan';
import FacultyGroup from '@/models/FacultyGroup';
import AcademicCalendar from '@/models/AcademicCalendar';
import CalendarEvent from '@/models/CalendarEvent';
import { calculateAvailableSlots } from '@/utils/availability';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();        const { planId, topicId, status, missed_reason, missed_reason_custom, marked_at } = await req.json();

        if (!planId || !topicId || !status) {
            return NextResponse.json({ error: 'Missing required parameters' }, { status: 400 });
        }

        const plan = await Plan.findById(planId) as IPlan;
        if (!plan) return NextResponse.json({ error: 'Plan not found' }, { status: 404 });

        const topicIndex = plan.syllabus_topics.findIndex((t: any) => t._id?.toString() === topicId);
        if (topicIndex === -1) return NextResponse.json({ error: 'Topic not found in plan' }, { status: 404 });

        const topic = plan.syllabus_topics[topicIndex];
        topic.completion_status = status;
        topic.marked_at = marked_at ? new Date(marked_at) : new Date();

        if (status === 'MISSED') {
            topic.missed_reason = missed_reason || undefined;
            topic.missed_reason_custom = missed_reason === 'OTHER' ? (missed_reason_custom || undefined) : undefined;
        } else {
            // Clear reason fields if not missed
            topic.missed_reason = undefined;
            topic.missed_reason_custom = undefined;
        }

        if (status === 'CONTINUED') {
            // Need to insert a duplicate topic & shift dates
            const continuedTopic: ITopic = {
                name: `${topic.name} (Continued)`,
                original_duration_mins: topic.original_duration_mins,
                lecture_sequence: topic.lecture_sequence + 0.1, // To keep it right after
                is_split: true,
                priority: topic.priority,
                completion_status: 'PENDING'
            };

            // Insert directly after the current topic
            plan.syllabus_topics.splice(topicIndex + 1, 0, continuedTopic);

            // Re-normalize sequence integers
            plan.syllabus_topics.forEach((t: ITopic, i: number) => {
                t.lecture_sequence = i + 1;
            });

            // Now, we must RECALCULATE all remaining PENDING topics' dates.
            // First, fetch the context:
            const facultyGroup = await FacultyGroup.findById(plan.faculty_group_id).lean();
            if (!facultyGroup) throw new Error("Faculty group not found");

            if (!facultyGroup.termStartDate || !facultyGroup.termEndDate) {
                throw new Error('Faculty group has no term dates configured. Cannot reschedule topics.');
            }

            const startDate = new Date(facultyGroup.termStartDate).toISOString().split('T')[0];
            const endDate = new Date(facultyGroup.termEndDate).toISOString().split('T')[0];
            const year = new Date(startDate).getFullYear();

            let calendar = await AcademicCalendar.findOne({ year }).lean();
            if (!calendar) {
                calendar = {
                    year: year,
                    holidays: INDIAN_HOLIDAYS_2026.map(h => ({ date: h.date, reason: h.reason })),
                    working_days_override: []
                };
            }

            const dynamicHolidayEvents = await CalendarEvent.find({ type: 'HOLIDAY' }).lean();
            const dynamicHolidays: Date[] = [];
            dynamicHolidayEvents.forEach((e: any) => {
                const start = new Date(e.date);
                dynamicHolidays.push(new Date(start));
                if (e.endDate) {
                    const end = new Date(e.endDate);
                    const curr = new Date(start);
                    while (curr < end) {
                        curr.setDate(curr.getDate() + 1);
                        dynamicHolidays.push(new Date(curr));
                    }
                }
            });

            // Ensure subject name is resolved for recalculation
            await plan.populate('subject_id');
            const subjectName = (plan.subject_id as any)?.name;

            // Re-calculate the deterministic slots (the 'budget')
            const { schedule, totalSlots } = calculateAvailableSlots(
                new Date(startDate),
                new Date(endDate),
                facultyGroup as any,
                calendar as any,
                subjectName,
                dynamicHolidays
            );

            // Re-map ALL topics
            // We iterate through all available schedule slots
            // If a topic is DONE/MISSED, it keeps its original date.
            // If a topic is PENDING/CONTINUED, we assign it the next available slot.
            // This implicitly shifts everything right.

            const flatSlots: { date: Date, startTime: string }[] = [];
            schedule.forEach(day => {
                day.slots.forEach(s => {
                    flatSlots.push({ date: new Date(day.date), startTime: s.startTime });
                });
            });

            // If we have more topics than slots, some turn to SELF_STUDY
            // So we assign slots sequentially.
            let slotCursor = 0;
            for (let i = 0; i < plan.syllabus_topics.length; i++) {
                const currentTopic = plan.syllabus_topics[i];

                // If it's done, it already has a date in the past, assume it consumed a slot.
                if (currentTopic.completion_status !== 'PENDING') {
                    // Let's assume it consumed the next available slot for sequence preservation, 
                    // or just use its existing date.
                    // But to ensure we don't assign multiple pending topics to the same slot,
                    // we should increment the slotCursor for every topic that is NOT SELF_STUDY.
                    if (currentTopic.priority !== 'SELF_STUDY') {
                        slotCursor++;
                    }
                    continue;
                }

                if (currentTopic.priority === 'SELF_STUDY') {
                    currentTopic.scheduled_date = undefined;
                    continue;
                }

                if (slotCursor < flatSlots.length) {
                    const matchedSlot = flatSlots[slotCursor];
                    const d = matchedSlot.date;
                    const timeParts = matchedSlot.startTime.split(':');
                    d.setHours(parseInt(timeParts[0]), parseInt(timeParts[1]), 0, 0);

                    currentTopic.scheduled_date = d;
                    slotCursor++;
                } else {
                    // Spilled over. Must convert to SELF_STUDY
                    currentTopic.scheduled_date = undefined;

                    // We can be smart: if it's CORE, maybe we convert a future PREREQUISITE to SELF_STUDY instead.
                    // But for simplicity in this epic: mark it as SELF_STUDY
                    currentTopic.priority = 'SELF_STUDY';
                }
            }
        }

        plan.markModified('syllabus_topics');
        await plan.save();

        return NextResponse.json({ success: true, message: 'Topic status updated' });

    } catch (error: any) {
        console.error('Update Topic Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
