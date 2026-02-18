import { eachDayOfInterval, format, isSameDay, isSunday } from 'date-fns';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { IAcademicCalendar } from '@/models/AcademicCalendar';

export interface DaySchedule {
    date: Date;
    dayOfWeek: string;
    slots: { startTime: string; endTime: string; room?: string; subject?: string; faculty?: string }[];
    isOverride: boolean;
}

/**
 * Deterministically calculates all available teaching slots between two dates.
 * Filters out holidays and Sundays (unless overridden).
 * Optional: Filters slots by Subject Name if provided.
 */
export function calculateAvailableSlots(
    startDate: Date,
    endDate: Date,
    facultyGroup: IFacultyGroup,
    calendar: IAcademicCalendar,
    subjectFilter?: string
): { totalSlots: number; schedule: DaySchedule[] } {

    const allDates = eachDayOfInterval({ start: startDate, end: endDate });
    const schedule: DaySchedule[] = [];
    let totalSlots = 0;

    // Convert DB types to handy sets/lookups
    const holidays = new Set(
        calendar.holidays.map((h) => new Date(h.date).toISOString().split('T')[0])
    );

    const overrides = new Set(
        calendar.working_days_override.map((d) => new Date(d).toISOString().split('T')[0])
    );

    // Mongoose Map to standard JS Object/Map handling
    // We expect facultyGroup to be LEAN (POJO) here, so timetable is just an object.
    let timetable: any = facultyGroup.timetable;
    if (timetable instanceof Map) {
        timetable = Object.fromEntries(timetable);
    }

    const normalize = (s: string) => s ? s.trim().toLowerCase() : '';
    const targetSubject = normalize(subjectFilter || '');

    for (const date of allDates) {
        const dateStr = format(date, 'yyyy-MM-dd');
        const dayOfWeek = format(date, 'EEEE'); // "Monday", "Tuesday"...

        // 1. Check if Holiday
        if (holidays.has(dateStr)) {
            continue;
        }

        // 2. Check availability
        const isOverride = overrides.has(dateStr);

        // Optional: Skip Sundays if not overridden
        if (isSunday(date) && !isOverride) {
            continue;
        }

        // 3. Get Slots for this day
        // TS Hack: timetable might be 'any' due to Mongoose Map dynamic nature
        const dailySlots = (timetable as any)[dayOfWeek];

        if (dailySlots && Array.isArray(dailySlots) && dailySlots.length > 0) {
            let filteredSlots = dailySlots;

            // Filter by Subject if provided
            if (targetSubject) {
                filteredSlots = dailySlots.filter((slot: any) => {
                    // Match Subject OR Faculty Code (in case user passed faculty code as subject filter, though UI says Subject)
                    // Let's stick to Subject matching for now.
                    // Access subject from slot. Assuming it exists now.
                    // Also check for 'subject' field in slot object
                    const slotSubject = normalize(slot.subject);
                    // Partial match? "Software Testing" vs "STQA"
                    // If exact match fails, maybe include?
                    // User data had "7CSE13:STQA:..."
                    // parsed subject is "STQA". Input subject might be "Software Testing".
                    // This mismatch is tricky. 
                    // For now, simple case-insensitive substring match?
                    return slotSubject.includes(targetSubject) || targetSubject.includes(slotSubject);
                });
            }

            if (filteredSlots.length > 0) {
                schedule.push({
                    date,
                    dayOfWeek,
                    slots: filteredSlots,
                    isOverride
                });
                totalSlots += filteredSlots.length;
            }
        }
    }

    return { totalSlots, schedule };
}
