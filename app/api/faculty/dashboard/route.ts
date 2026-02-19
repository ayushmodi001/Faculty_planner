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

        const facultyName = session.name; // This must match the name in Timetable
        if (!facultyName) {
            return NextResponse.json({ error: "Faculty name not found in session" }, { status: 400 });
        }

        // 2. Determine Today's Schedule
        const today = new Date();
        const dayOfWeek = format(today, 'EEEE'); // e.g. "Monday"
        const dayKey = dayOfWeek;

        // 3. Find relevant Timetable Slots
        // We look for FacultyGroups where today's timetable contains a slot with this faculty's name
        // Utilizing MongoDB elemMatch on the dynamic key if possible, OR fetching candidate groups
        // Query: "timetable.Monday" has element where faculty == facultyName
        const query = { [`timetable.${dayKey}`]: { $elemMatch: { faculty: facultyName } } };

        // We use regex for case-insensitive matching if possible, but $elemMatch with regex is fine
        // Note: The UI saves faculty as entered string. 
        // Ideally we should use user ID, but we are sticking to name mapping as requested.
        const candidateGroups = await FacultyGroup.find(query).lean();

        // Refine slots
        const mySlots: any[] = [];

        for (const group of candidateGroups) {
            const slots = (group.timetable as any)[dayKey] || [];

            for (const slot of slots) {
                // Fuzzy Name Match
                if (slot.faculty && slot.faculty.toLowerCase() === facultyName.toLowerCase()) {

                    // Found a slot! Now find the Topic.
                    // 4. Find Active Plan for this Group + Subject
                    let topicName = "Topic not scheduled";
                    let isPlanActive = false;

                    if (slot.subject) {
                        const plan = await Plan.findOne({
                            faculty_id: group._id, // References FacultyGroup
                            subject: slot.subject,
                            status: 'ACTIVE'
                        }).lean() as IPlan;

                        if (plan) {
                            isPlanActive = true;
                            // Find topic for today
                            // We compare dates YYYY-MM-DD
                            const todayStr = format(today, 'yyyy-MM-dd');
                            const todayTopic = plan.syllabus_topics.find((t: ITopic) =>
                                t.scheduled_date &&
                                new Date(t.scheduled_date).toISOString().split('T')[0] === todayStr
                            );

                            if (todayTopic) {
                                topicName = todayTopic.name;
                            } else {
                                topicName = "No topic scheduled for today";
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
                        isPlanActive
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
