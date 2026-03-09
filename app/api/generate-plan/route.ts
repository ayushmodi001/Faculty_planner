import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OpenAI from 'openai';
import { z } from 'zod';
import FacultyGroup from '@/models/FacultyGroup';
import AcademicCalendar from '@/models/AcademicCalendar';
import CalendarEvent from '@/models/CalendarEvent';
import Plan from '@/models/Plan';
import Subject from '@/models/Subject';
import { calculateAvailableSlots } from '@/utils/availability';
import { AIPlanResponseSchema } from '../../../models/AIOutputSchema';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';
import User from '@/models/User';

// Initialize OpenRouter (OpenAI compatible SDK)
const getOpenAI = () => {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        throw new Error("OPENROUTER_API_KEY is not defined in environment variables.");
    }
    return new OpenAI({
        baseURL: 'https://openrouter.ai/api/v1',
        apiKey: apiKey,
    });
};

const InputSchema = z.object({
    facultyGroupId: z.string(),
    syllabusText: z.string().min(50),
    subject: z.string(),
    facultyName: z.string().optional(),
    facultyNames: z.array(z.string()).optional()
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // 1. Validate Input
        const { facultyGroupId, syllabusText, subject, facultyName, facultyNames } = InputSchema.parse(body);
        const resolvedFacultyNames = facultyNames || (facultyName ? [facultyName] : []);

        // 2. Fetch Context Data
        const facultyGroup = await FacultyGroup.findById(facultyGroupId).lean();
        if (!facultyGroup) {
            console.log(`[Planner Error] FacultyGroup not found: ${facultyGroupId}`);
            return NextResponse.json({ error: 'Faculty Group not found' }, { status: 404 });
        }

        if (!facultyGroup.termStartDate || !facultyGroup.termEndDate) {
            return NextResponse.json({ error: 'Faculty Group has no term dates configured.' }, { status: 400 });
        }

        const startDate = new Date(facultyGroup.termStartDate).toISOString().split('T')[0];
        const endDate = new Date(facultyGroup.termEndDate).toISOString().split('T')[0];
        const year = new Date(startDate).getFullYear();

        let calendar = await AcademicCalendar.findOne({ year }).lean();

        // FAIL-SAFE: If no calendar in DB, use static defaults
        if (!calendar) {
            console.warn(`[Planner] Calendar not found for ${year}. Using static defaults.`);
            calendar = {
                year: year,
                holidays: INDIAN_HOLIDAYS_2026.map(h => ({ date: h.date, reason: h.reason })),
                working_days_override: []
            };
        }

        // Fetch Dynamic Holidays (and expand ranges)
        const dynamicHolidayEvents = await CalendarEvent.find({ type: 'HOLIDAY' }).lean();
        const dynamicHolidays: Date[] = [];

        dynamicHolidayEvents.forEach((e: any) => {
            const start = new Date(e.date);
            dynamicHolidays.push(new Date(start)); // Add start date

            if (e.endDate) {
                const end = new Date(e.endDate);
                const curr = new Date(start);
                // Loop to add subsequent days
                while (curr < end) {
                    curr.setDate(curr.getDate() + 1);
                    dynamicHolidays.push(new Date(curr));
                }
            }
        });
        console.log(`[Planner] Expanded to ${dynamicHolidays.length} holiday dates from ${dynamicHolidayEvents.length} events.`);

        // Debug: Check timetable structure
        const ttForDebug = facultyGroup.timetable instanceof Map ? Object.fromEntries(facultyGroup.timetable) : (facultyGroup.timetable as any) || {};
        console.log(`[Planner] Faculty Group: ${facultyGroup.name}, Timetable keys: ${Object.keys(ttForDebug).join(', ')}`);

        // Check for term validity
        if (facultyGroup.termStartDate && new Date(startDate) < new Date(facultyGroup.termStartDate)) {
            console.warn(`[Planner] Warning: Requested start date ${startDate} is before term start ${facultyGroup.termStartDate}`);
        }

        // 3. Deterministic Availability Calculation
        // This tells us exactly how many slots we have (The "Budget")
        const { totalSlots, schedule } = calculateAvailableSlots(
            new Date(startDate),
            new Date(endDate),
            facultyGroup as any, // Cast because lean() type might be slightly different than Document interface
            calendar as any,
            subject, // Pass subject for filtering
            dynamicHolidays // Pass dynamic holidays
        );

        console.log(`[Planner] Calculated Total Slots: ${totalSlots} between ${startDate} and ${endDate}`);

        if (totalSlots === 0) {
            // DIAGNOSTIC STEP: Check if slots exist *without* subject filter
            const { totalSlots: anySlots, schedule: anySchedule } = calculateAvailableSlots(
                new Date(startDate),
                new Date(endDate),
                facultyGroup as any,
                calendar as any,
                undefined, // No subject filter
                dynamicHolidays
            );

            if (anySlots > 0) {
                // Slots exist, but not for this subject
                const availableSubjects = new Set();
                anySchedule.forEach(day => day.slots.forEach(s => s.subject && availableSubjects.add(s.subject)));
                const subjectList = Array.from(availableSubjects).join(", ");

                return NextResponse.json({
                    error: `No slots found for subject "${subject}" in the timetable between ${startDate} and ${endDate}. The timetable has slots configured for: [${subjectList || 'Unknown'}]. Please update the Faculty Group Timetable to include "${subject}".`
                }, { status: 400 });
            } else {
                // No slots exist at all (Term dates or Holidays)
                const termInfo = facultyGroup.termStartDate && facultyGroup.termEndDate
                    ? `(Term: ${new Date(facultyGroup.termStartDate).toLocaleDateString()} - ${new Date(facultyGroup.termEndDate).toLocaleDateString()})`
                    : '(No term limits configured)';

                return NextResponse.json({
                    error: `No teaching slots available for this Faculty Group in the requested range ${startDate} to ${endDate}. Check: 1) The Term Dates ${termInfo} cover this range. 2) The Timetable has slots defined for weekdays. 3) The range isn't entirely holidays.`
                }, { status: 400 });
            }
        }

        // 4. Construct Prompt Elements
        let facultyContext = "";
        const facultyUserIds: any[] = [];

        for (const name of resolvedFacultyNames) {
            const user = await User.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } }).lean();
            if (user) {
                facultyUserIds.push(user._id);
                if (user.role === 'HOD') {
                    facultyContext += `\n      FACULTY PROFILE [${name} - HOD]: Experienced leadership.`;
                } else if (user.facultyType === 'SENIOR') {
                    facultyContext += `\n      FACULTY PROFILE [${name} - SENIOR]: Standard academic pacing.`;
                }
            }
        }

        if (resolvedFacultyNames.length > 1) {
            facultyContext += `\n      NOTE: This syllabus is SPLIT between ${resolvedFacultyNames.join(' and ')}. Focus on cohesive topic flow.`;
        }

        const systemPrompt = `
      You are an expert Academic Planner for a University.${facultyContext}
      Your goal is to parse a raw syllabus and map it into a strictly sequential list of INDIVIDUAL lecture topics.

      CRITICAL CONSTRAINTS:
      - You have a MAXIMUM BUDGET of ${totalSlots} lecture slots.
      - **DO NOT** add extra "Buffer", "Revision", "Practice", or "Review" sessions unless they are explicitly written in the syllabus provided.
      - **DO NOT** feel the need to fill all ${totalSlots} slots. Stop once you have mapped the entire syllabus.
      - Extract the SPECIFIC SUB-TOPICS detailed in the syllabus and assign ONE concrete sub-topic to each lecture.
      - If a single sub-topic is very large, split it: "White Box Testing - Part 1", "White Box Testing - Part 2".
      - If the syllabus contains duration indicators (like "Hours: 8" for a unit), map exactly 8 lectures for that unit's sub-topics.
      - If the syllabus is too long for the ${totalSlots} budget, mark less critical or advanced sub-topics as "is_self_study: true". Self-study topics DO NOT count towards the ${totalSlots} lecture limit.
      
      OUTPUT FORMAT:
      Return ONLY a JSON object matching this schema:
      {
        "topics": [
          { 
            "title": "Specific Sub-Topic Name", 
            "duration_mins": 60, 
            "is_self_study": false, 
            "sequence_order": 1,
            "reason_for_decision": "Mapping syllabus content"
          }
        ],
        "total_lectures_planned": <total number of non-self-study topics, should be <= ${totalSlots}>,
        "metadata": { "notes": "Any assumptions made" }
      }
    `;

        // 5. Call LLM
        console.log(`[Planner] Calling LLM for ${subject}...`);
        const openai = getOpenAI();

        const completion = await openai.chat.completions.create({
            model: "openai/gpt-oss-120b", // Better performance for JSON tasks
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: `Here is the syllabus for ${subject}:\n\n${syllabusText}` }
            ],
            response_format: { type: "json_object" }
        });
        console.log(`[Planner] LLM responded. Token usage: ${completion.usage?.total_tokens}`);

        const content = completion.choices[0].message.content;
        if (!content) throw new Error("Empty response from AI");

        // 6. Validate AI Response
        const cleanedContent = cleanJson(content);
        console.log(`[Planner] Cleaned AI Response:`, cleanedContent.substring(0, 100) + "...");

        let aiPlan;
        try {
            aiPlan = AIPlanResponseSchema.parse(JSON.parse(cleanedContent));
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.log("Raw Content:", content);
            throw new Error("Failed to parse AI response. The model might have returned invalid JSON.");
        }

        // 7. Map AI Topics to Deterministic Slots
        // This is the "Magic" merging step
        const finalTopics = [];
        let slotIndex = 0;

        // Flatten the daily schedule into a linear list of slots
        const linearSlots = schedule.flatMap(day => day.slots.map(slot => ({
            date: day.date,
            startTime: slot.startTime,
            endTime: slot.endTime
        })));

        for (const topic of aiPlan.topics) {
            if (topic.is_self_study) {
                // Self study topics don't consume a physical slot
                finalTopics.push({
                    name: topic.title,
                    original_duration_mins: topic.duration_mins,
                    lecture_sequence: topic.sequence_order || (finalTopics.length + 1),
                    is_split: false, // AI output schema has is_split but we can default
                    priority: 'SELF_STUDY',
                    completion_status: 'PENDING',
                    scheduled_date: undefined // No date for self study
                });
            } else {
                // Assign to next available slot
                if (slotIndex < linearSlots.length) {
                    const slot = linearSlots[slotIndex];
                    // Construct exact datetime for this slot correctly bridging the gap
                    // schedule.date only holds the Date part, we merge the startTime string
                    const [h, m] = slot.startTime.split(':');
                    const exactDate = new Date(slot.date);
                    exactDate.setHours(parseInt(h), parseInt(m), 0, 0);

                    finalTopics.push({
                        name: topic.title,
                        original_duration_mins: topic.duration_mins,
                        lecture_sequence: topic.sequence_order || (finalTopics.length + 1),
                        is_split: false,
                        priority: 'CORE',
                        completion_status: 'PENDING',
                        scheduled_date: exactDate // The deterministic date + time!
                    });
                    slotIndex++;
                } else {
                    // Overflow! We ran out of slots even though AI tried to fit budget
                    finalTopics.push({
                        name: topic.title,
                        original_duration_mins: topic.duration_mins,
                        lecture_sequence: topic.sequence_order || (finalTopics.length + 1),
                        priority: 'SELF_STUDY', // Force to self study
                        completion_status: 'PENDING',
                        notes: "Forced self-study due to slot overflow"
                    });
                }
            }
        }

        // 8. Resolve precise referential ObjectIds for DB Plan Creation
        const foundSubject = await Subject.findOne({ name: subject });

        if (!foundSubject) throw new Error("Could not resolve Subject ID. Make sure subject exists in registry.");
        if (facultyUserIds.length === 0) throw new Error("Could not resolve any Faculty User IDs. Ensure teachers are registered.");

        // Find interfering events ids to map them
        const interferingEvents = await CalendarEvent.find({
            date: { $gte: new Date(startDate), $lte: new Date(endDate) }
        });

        // 9. Inactivate previous plans for the same group & subject
        await Plan.updateMany(
            { faculty_group_id: facultyGroupId, subject_id: foundSubject._id },
            { $set: { status: 'ARCHIVED' } }
        );        // 10. Save Plan to DB
        const newPlan = await Plan.create({
            faculty_group_id: facultyGroupId,
            faculty_ids: facultyUserIds,
            subject_id: foundSubject._id,
            department_id: facultyGroup.department_id,
            events_id: interferingEvents.map(e => e._id),
            lecture_duration_mins: 60,
            total_slots_available: totalSlots,
            status: 'ACTIVE',
            syllabus_topics: finalTopics
        });

        return NextResponse.json({ success: true, planId: newPlan._id, totalSlots });

    } catch (error: any) {
        console.error("Planning Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}

function cleanJson(text: string): string {
    // Remove markdown code blocks if present
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = text.match(codeBlockRegex);
    if (match) {
        text = match[1];
    } else {
        const simpleCodeBlockRegex = /```\s*([\s\S]*?)\s*```/;
        const matchSimple = text.match(simpleCodeBlockRegex);
        if (matchSimple) {
            text = matchSimple[1];
        }
    }
    // Attempt to find the first { and last } to remove any leading/trailing text
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1) {
        return text.substring(start, end + 1);
    }
    return text;
}
