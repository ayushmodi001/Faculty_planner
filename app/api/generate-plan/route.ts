import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import OpenAI from 'openai';
import { z } from 'zod';
import FacultyGroup from '@/models/FacultyGroup';
import AcademicCalendar from '@/models/AcademicCalendar';
import Plan from '@/models/Plan';
import { calculateAvailableSlots } from '@/utils/availability';
import { AIPlanResponseSchema } from '@/models/AIOutputSchema';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';

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
    startDate: z.string(), // YYYY-MM-DD
    endDate: z.string(),   // YYYY-MM-DD
    syllabusText: z.string().min(50),
    subject: z.string(),
});

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // 1. Validate Input
        const { facultyGroupId, startDate, endDate, syllabusText, subject } = InputSchema.parse(body);
        const year = new Date(startDate).getFullYear();

        // 2. Fetch Context Data
        const facultyGroup = await FacultyGroup.findById(facultyGroupId).lean();
        if (!facultyGroup) {
            console.log(`[Planner Error] FacultyGroup not found: ${facultyGroupId}`);
            return NextResponse.json({ error: 'Faculty Group not found' }, { status: 404 });
        }

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

        // Debug: Check timetable structure
        console.log(`[Planner] Faculty Group: ${facultyGroup.name}, Timetable keys: ${Object.keys(facultyGroup.timetable || {}).join(', ')}`);

        // 3. Deterministic Availability Calculation
        // This tells us exactly how many slots we have (The "Budget")
        const { totalSlots, schedule } = calculateAvailableSlots(
            new Date(startDate),
            new Date(endDate),
            facultyGroup as any, // Cast because lean() type might be slightly different than Document interface
            calendar as any
        );

        console.log(`[Planner] Calculated Total Slots: ${totalSlots} between ${startDate} and ${endDate}`);

        if (totalSlots === 0) {
            return NextResponse.json({
                error: `No available slots found. Check if the Faculty Group has a timetable for the requested days (${startDate} to ${endDate}).`
            }, { status: 400 });
        }

        // 4. Construct Prompt for AI
        const systemPrompt = `
      You are an expert Academic Planner for a University.
      Your goal is to parse a raw syllabus and map it into a strictly sequential list of lecture topics.

      CONSTRAINTS:
      - You have a STRICT BUDGET of ${totalSlots} lecture slots (60 mins each).
      - If the syllabus is too long, you MUST mark less critical topics as "is_self_study: true".
      - You can split large topics into "Part 1" and "Part 2" if needed.
      - Maintain logical prerequisite order.
      - **CRITICAL**: If the syllabus text contains duration indicators (like "Hours", "Hrs", "T", "L", or numbers at the end of lines like "15 8"), USE THEM as a guide for how many lectures to allocate to that unit.
      
      OUTPUT FORMAT:
      Return ONLY a JSON object matching this schema:
      {
        "topics": [
          { 
            "title": "Topic Name", 
            "duration_mins": 60, 
            "is_self_study": false, 
            "sequence_order": 1,
            "reason_for_decision": "Core concept"
          }
        ],
        "total_lectures_planned": ${totalSlots},
        "metadata": { ... }
      }
    `;

        // 5. Call LLM
        console.log(`[Planner] Calling LLM for ${subject}...`);
        const openai = getOpenAI();

        const completion = await openai.chat.completions.create({
            model: "mistralai/mistral-7b-instruct:free", // Low cost/free model for testing
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
        const aiPlan = AIPlanResponseSchema.parse(JSON.parse(content));

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
                    lecture_sequence: topic.sequence_order,
                    is_split: false, // AI output schema has is_split but we can default
                    priority: 'SELF_STUDY',
                    completion_status: 'PENDING',
                    scheduled_date: undefined // No date for self study
                });
            } else {
                // Assign to next available slot
                if (slotIndex < linearSlots.length) {
                    const slot = linearSlots[slotIndex];
                    finalTopics.push({
                        name: topic.title,
                        original_duration_mins: topic.duration_mins,
                        lecture_sequence: topic.sequence_order,
                        is_split: false,
                        priority: 'CORE',
                        completion_status: 'PENDING',
                        scheduled_date: slot.date // The deterministic date!
                    });
                    slotIndex++;
                } else {
                    // Overflow! We ran out of slots even though AI tried to fit budget
                    finalTopics.push({
                        name: topic.title,
                        original_duration_mins: topic.duration_mins,
                        lecture_sequence: topic.sequence_order,
                        priority: 'SELF_STUDY', // Force to self study
                        completion_status: 'PENDING',
                        notes: "Forced self-study due to slot overflow"
                    });
                }
            }
        }

        // 8. Save Plan to DB
        const newPlan = await Plan.create({
            faculty_id: facultyGroupId,
            subject: subject,
            lecture_duration_mins: 60,
            total_slots_available: totalSlots,
            status: 'DRAFT',
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
