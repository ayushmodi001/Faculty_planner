import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { verifyJWT } from '@/lib/auth';
import { UserRole } from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';

const SlotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
    room: z.string().optional(),
    subject: z.string().optional(),
    faculty: z.string().optional(),
    type: z.enum(['Lecture', 'Lab', 'Break', 'Seminar', 'Tutorial', 'Workshop', 'Self Study', 'Project']).default('Lecture')
});

const TimetableUpdateSchema = z.object({
    facultyGroupId: z.string(),
    timetable: z.record(z.string(), z.array(SlotSchema))
});

export async function GET(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

        if (session.role === UserRole.HOD || session.role === UserRole.FACULTY || session.role === UserRole.STUDENT) {
            const isDeptMatch = session.department_id && group.department_id && session.department_id === group.department_id.toString();
            const groupIds = Array.isArray(session.facultyGroupIds) ? session.facultyGroupIds : [];
            const isGroupMatch = groupIds.includes(id) || session.facultyGroupId === id;
            if (!isDeptMatch && !isGroupMatch) {
                return NextResponse.json({ error: "Access denied to this timetable" }, { status: 403 });
            }
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
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // Only PRINCIPAL, ADMIN, HOD, and SENIOR FACULTY can edit timetables
        const canEdit = session.role === UserRole.PRINCIPAL || session.role === UserRole.ADMIN || session.role === UserRole.HOD || (session.role === UserRole.FACULTY && session.facultyType === 'SENIOR');
        if (!canEdit) return NextResponse.json({ error: "Insufficient permissions to edit timetable" }, { status: 403 });

        await dbConnect();
        const body = await req.json();
        const validation = TimetableUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Data", details: validation.error }, { status: 400 });
        }

        const { facultyGroupId, timetable } = validation.data;

        const targetGroup = await FacultyGroup.findById(facultyGroupId).lean();
        if (!targetGroup) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        // Check department constraint for HOD / SENIOR FACULTY
        if (session.role === UserRole.HOD || (session.role === UserRole.FACULTY && session.facultyType === 'SENIOR')) {
            const isDeptMatch = session.department_id && targetGroup.department_id && session.department_id === targetGroup.department_id.toString();
            if (!isDeptMatch) return NextResponse.json({ error: "Cannot edit timetable outside of your department" }, { status: 403 });
        }

        // Conflict Validation
        const otherGroups = await FacultyGroup.find({ _id: { $ne: facultyGroupId } }).lean();
        const conflicts: string[] = [];

        for (const [day, slots] of Object.entries(timetable)) {
            for (const slot of slots) {
                if (!slot.faculty) continue;

                for (const group of otherGroups) {
                    const groupSlots = (() => {
                        const tt = group.timetable instanceof Map
                            ? Object.fromEntries(group.timetable)
                            : (group.timetable as any) || {};
                        return tt[day] || [];
                    })();
                    for (const gSlot of groupSlots) {
                        if (gSlot.faculty === slot.faculty) {
                            if (slot.startTime < gSlot.endTime && slot.endTime > gSlot.startTime) {
                                conflicts.push(`Faculty ${slot.faculty} is already teaching in group '${group.name}' on ${day} from ${gSlot.startTime} to ${gSlot.endTime}.`);
                            }
                        }
                    }
                }
            }
        }

        if (conflicts.length > 0) {
            return NextResponse.json({ error: "Faculty conflict detected", details: conflicts[0] }, { status: 409 });
        }

        // 1. Save Timetable
        const updatedGroup = await FacultyGroup.findByIdAndUpdate(facultyGroupId, {
            $set: { timetable: timetable }
        }, { new: true }).lean();

        if (!updatedGroup) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        // 2. Synchronize Active Plans with new Timetable
        const activePlans = await Plan.find({ faculty_group_id: facultyGroupId, status: 'ACTIVE' });

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
                // Populate subject to get name for filtering
                await plan.populate('subject_id', 'name');
                const subjectName = (plan.subject_id as any)?.name || '';

                const { totalSlots, schedule } = calculateAvailableSlots(
                    new Date(startDate),
                    new Date(endDate),
                    updatedGroup as any,
                    calendar as any,
                    subjectName,
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
                console.log(`[Timetable Sync] Synchronized plan for ${subjectName}. Budget is now ${totalSlots}, mapped ${topicsReassigned} core topics.`);
            }
        }

        return NextResponse.json({ success: true, message: "Timetable updated and plans synchronized" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        const canEdit = session.role === UserRole.PRINCIPAL || session.role === UserRole.ADMIN || session.role === UserRole.HOD || (session.role === UserRole.FACULTY && session.facultyType === 'SENIOR');
        if (!canEdit) return NextResponse.json({ error: "Insufficient permissions to delete timetable" }, { status: 403 });

        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        // Clear the timetable (set to empty object or structure with empty arrays)
        // We set it to default empty structure for consistency
        const groupToCheck = await FacultyGroup.findById(id).lean();
        if (!groupToCheck) return NextResponse.json({ error: "Group not found" }, { status: 404 });

        if (session.role === UserRole.HOD || (session.role === UserRole.FACULTY && session.facultyType === 'SENIOR')) {
            const isDeptMatch = session.department_id && groupToCheck.department_id && session.department_id === groupToCheck.department_id.toString();
            if (!isDeptMatch) return NextResponse.json({ error: "Cannot clear timetable outside of your department" }, { status: 403 });
        }

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
