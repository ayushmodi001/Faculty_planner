import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import Plan, { IPlan, ITopic } from '@/models/Plan';
import { getSession } from '@/lib/auth';
import { format } from 'date-fns';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();

        // 1. Auth Check - Identify Faculty
        const session: any = await getSession();
        if (!session || session.role !== 'FACULTY') {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const facultyName = session.name || "";
        let facultyId = session.sub;

        // Force string conversion and handle potential object serialization issues
        if (facultyId && typeof facultyId !== 'string') {
            facultyId = facultyId.toString();
        }

        if (!facultyId || typeof facultyId !== 'string' || !/^[0-9a-fA-F]{24}$/.test(facultyId)) {
            console.error("[Auth] Invalid Faculty ID in session:", facultyId);
            return NextResponse.json({ error: "Session invalid: Please log out and back in." }, { status: 400 });
        }

        // 2. Determine Today's Schedule
        const today = new Date();
        const dayKey = format(today, 'EEEE');

        // 3. Find candidate groups where this faculty member is listed
        const query: any = {
            $or: [
                { faculty_ids: facultyId }
            ]
        };

        if (facultyName) {
            query.$or.push({ [`timetable.${dayKey}.faculty`]: { $regex: new RegExp(`^${facultyName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`, 'i') } });
        }

        const candidateGroups = await FacultyGroup.find(query).lean();

        // Refine slots
        const mySlots: any[] = [];

        for (const group of candidateGroups) {
            // Normalize timetable: lean() should give plain object, but guard against Map instances
            const tt: Record<string, any[]> = group.timetable instanceof Map
                ? Object.fromEntries(group.timetable)
                : (group.timetable as any) || {};
            const slots = tt[dayKey] || [];

            for (const slot of slots) {
                // Match by ID primarily, fallback to Name
                const isMySlotById = slot.faculty_id && slot.faculty_id.toString() === facultyId;
                const isMySlotByName = facultyName && slot.faculty && slot.faculty.toLowerCase() === facultyName.toLowerCase();
                const isMySlot = isMySlotById || isMySlotByName;
                const isEmptySlot = !slot.faculty && !slot.faculty_id;                    if (isMySlot) {
                    // Found a slot! Now find the Topic.
                    // 4. Find Active Plan for this Group + Subject
                    let topicName = "Topic not scheduled";
                    let isPlanActive = false;
                    let planId: string | undefined;
                    let topicId: string | undefined;
                    let completion_status: string = 'PENDING';
                    let missed_reason: string | undefined;
                    let missed_reason_custom: string | undefined;
                    let marked_at: Date | undefined;

                    if (slot.subject) {
                        const SubjectModel = (await import('@/models/Subject')).default;
                        const targetSub = await SubjectModel.findOne({ name: slot.subject }).lean();

                        const plan = targetSub ? await Plan.findOne({
                            faculty_group_id: group._id,
                            subject_id: targetSub._id,
                            status: 'ACTIVE'
                        }).lean() as IPlan : null;

                        if (plan) {
                            isPlanActive = true;
                            planId = (plan as any)._id.toString();
                            // Find topic for today that matches EXACT TIME
                            const todayStr = format(today, 'yyyy-MM-dd');
                            const targetTimeStr = slot.startTime; // e.g., "09:00"

                            const todayTopic = (plan.syllabus_topics || []).find((t: ITopic) => {
                                if (!t.scheduled_date) return false;
                                try {
                                    const dateObj = new Date(t.scheduled_date);
                                    if (isNaN(dateObj.getTime())) return false;
                                    const isSameDay = format(dateObj, 'yyyy-MM-dd') === todayStr;
                                    const isSameTime = format(dateObj, 'HH:mm') === targetTimeStr;
                                    return isSameDay && isSameTime;
                                } catch (e) {
                                    return false;
                                }
                            });

                            if (todayTopic) {
                                topicName = todayTopic.name;
                                topicId = (todayTopic as any)._id?.toString();
                                completion_status = todayTopic.completion_status;
                                missed_reason = todayTopic.missed_reason;
                                missed_reason_custom = todayTopic.missed_reason_custom;
                                marked_at = todayTopic.marked_at;
                            } else {
                                topicName = "No active topic scheduled (Check Term Dates / Plan Budget)";
                            }
                        } else {
                            topicName = "No active plan found";
                        }
                    }

                    mySlots.push({
                        id: `${group._id}-${slot.startTime}`, // Unique key
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        formattedTime: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
                        subject: slot.subject || "Unknown Subject",
                        groupName: group.name,
                        room: slot.room || "TBD",
                        topic: topicName,
                        isPlanActive,
                        planId,
                        topicId,
                        completion_status,
                        missed_reason,
                        missed_reason_custom,
                        marked_at,
                    });
                } else if (isEmptySlot) {
                    // Include empty slots as requested
                    mySlots.push({
                        id: `${group._id}-${slot.startTime}-empty`, // Unique key
                        startTime: slot.startTime,
                        endTime: slot.endTime,
                        formattedTime: `${formatTime(slot.startTime)} - ${formatTime(slot.endTime)}`,
                        subject: "No lecture allocated",
                        groupName: group.name,
                        room: slot.room || "-",
                        topic: "Free Slot",
                        isPlanActive: false
                    });
                }
            }
        }

        // Sort by start time
        mySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));

        return NextResponse.json({
            facultyName,
            date: format(today, 'PPP'),
            schedule: mySlots
        });

    } catch (error: any) {
        console.error("Dashboard Error:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// Helper: 13:00 -> 01:00 PM
function formatTime(timeStr: string) {
    if (!timeStr) return "";
    const [h, m] = timeStr.split(':');
    const date = new Date();
    date.setHours(parseInt(h));
    date.setMinutes(parseInt(m));
    return format(date, 'hh:mm a');
}
