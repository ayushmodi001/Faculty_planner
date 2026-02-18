import { z } from 'zod';

// Topic Schema (Source of Truth for Syllabus)
export const TopicSchema = z.object({
    name: z.string(),
    original_duration_mins: z.number(),
    lecture_sequence: z.number(),
    is_split: z.boolean().default(false),
    priority: z.enum(['CORE', 'PREREQUISITE', 'SELF_STUDY']),
    scheduled_date: z.date().optional(),
    completion_status: z.enum(['PENDING', 'DONE', 'MISSED']).default('PENDING'),
    notes: z.string().optional(),
});

export type Topic = z.infer<typeof TopicSchema>;

// Plan Schema
export const PlanSchema = z.object({
    faculty_id: z.string(), // ObjectId as string
    subject: z.string(),
    lecture_duration_mins: z.number().default(60),
    total_slots_available: z.number(),
    status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
    syllabus_topics: z.array(TopicSchema),
});

export type Plan = z.infer<typeof PlanSchema>;

// Calendar Day Schema
export interface CalendarDay {
    date: Date;
    isHoliday: boolean;
    reason?: string;
    isWorkingDayOverride?: boolean;
}

// Faculty Timetable Slot
export interface TimeSlot {
    dayOfWeek: string; // "Monday", "Tuesday" etc.
    startTime: string; // "10:00"
    endTime: string;   // "11:00"
    room?: string;
}

export interface FacultyGroupData {
    name: string;
    subjects: string[];
    timetable: Record<string, TimeSlot[]>; // Key: "Monday" -> Slots
}
