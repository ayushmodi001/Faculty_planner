import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';

const SlotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
    room: z.string().optional(),
    subject: z.string().optional(),
    faculty: z.string().optional(),
    type: z.enum(['Lecture', 'Lab', 'Break', 'Self Study', 'Project']).default('Lecture')
});

const TimetableUpdateSchema = z.object({
    facultyGroupId: z.string(),
    timetable: z.record(z.string(), z.array(SlotSchema))
});

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        const group = await FacultyGroup.findById(id).lean();
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            timetable: group.timetable
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

import Plan from '@/models/Plan';
import AcademicCalendar from '@/models/AcademicCalendar';
import CalendarEvent from '@/models/CalendarEvent';
import { calculateAvailableSlots } from '@/utils/availability';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const validation = TimetableUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Data", details: validation.error }, { status: 400 });
        }

        const { facultyGroupId, timetable } = validation.data;

        // 1. Save Timetable
        const updatedGroup = await FacultyGroup.findByIdAndUpdate(facultyGroupId, {
            $set: { timetable: timetable }
        }, { new: true }).lean();

        if (!updatedGroup) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // 2. Synchronize Active Plans with new Timetable
        const activePlans = await Plan.find({ faculty_id: facultyGroupId, status: 'ACTIVE' });

        if (activePlans.length > 0 && updatedGroup.termStartDate && updatedGroup.termEndDate) {
            const startDate = new Date(updatedGroup.termStartDate).toISOString().split('T')[0];
            const endDate = new Date(updatedGroup.termEndDate).toISOString().split('T')[0];
            const year = new Date(startDate).getFullYear();

            // Fetch Holidays Once
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

            // Reschedule each plan
            for (const plan of activePlans) {
                const { totalSlots, schedule } = calculateAvailableSlots(
                    new Date(startDate),
                    new Date(endDate),
                    updatedGroup as any,
                    calendar as any,
                    plan.subject,
                    dynamicHolidays
                );

                const linearSlots = schedule.flatMap((day: any) => day.slots.map((slot: any) => ({
                    date: day.date,
                    startTime: slot.startTime,
                    endTime: slot.endTime
                })));

                let slotIndex = 0;
                let topicsReassigned = 0;

                for (const topic of plan.syllabus_topics) {
                    if (topic.priority !== 'SELF_STUDY') {
                        if (slotIndex < linearSlots.length) {
                            const slot = linearSlots[slotIndex];
                            const [h, m] = slot.startTime.split(':');
                            const exactDate = new Date(slot.date);
                            exactDate.setHours(parseInt(h), parseInt(m), 0, 0);

                            topic.scheduled_date = exactDate;
                            slotIndex++;
                        } else {
                            // Slot overflow for this topic due to budget shrinking
                            topic.scheduled_date = undefined;
                        }
                        topicsReassigned++;
                    }
                }

                plan.total_slots_available = totalSlots;
                plan.markModified('syllabus_topics');
                await plan.save();
                console.log(`[Timetable Sync] Synchronized plan for ${plan.subject}. Budget is now ${totalSlots}, mapped ${topicsReassigned} core topics.`);
            }
        }

        return NextResponse.json({ success: true, message: "Timetable updated and plans synchronized" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        // Clear the timetable (set to empty object or structure with empty arrays)
        // We set it to default empty structure for consistency
        const defaults: any = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(d => defaults[d] = []);

        const group = await FacultyGroup.findByIdAndUpdate(id, {
            $set: { timetable: defaults }
        }, { new: true });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Timetable cleared"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
