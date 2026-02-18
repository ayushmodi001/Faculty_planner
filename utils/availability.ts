import { eachDayOfInterval, format, isSameDay, isSunday } from 'date-fns';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { IAcademicCalendar } from '@/models/AcademicCalendar';

export interface DaySchedule {
    date: Date;
    dayOfWeek: string;
    slots: { startTime: string; endTime: string; room?: string }[];
    isOverride: boolean;
}

/**
 * Deterministically calculates all available teaching slots between two dates.
 * Filters out holidays and Sundays (unless overridden).
 */
export function calculateAvailableSlots(
    startDate: Date,
    endDate: Date,
    facultyGroup: IFacultyGroup,
    calendar: IAcademicCalendar
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
    // But for safety, we check if it is a Map (in case passed from a non-lean document).
    let timetable: any = facultyGroup.timetable;
    if (timetable instanceof Map) {
        timetable = Object.fromEntries(timetable);
    }

    for (const date of allDates) {
        const dateStr = date.toISOString().split('T')[0];
        const dayOfWeek = format(date, 'EEEE'); // "Monday", "Tuesday"...

        // 1. Check if Holiday
        if (holidays.has(dateStr)) {
            continue;
        }

        // 2. Check availability
        // If it's an override date, we assume it works regardless of being Sunday
        // Otherwise, we skip Sundays by default (optional, but standard for academics)
        const isOverride = overrides.has(dateStr);

        // Optional: Skip Sundays if not overridden
        if (isSunday(date) && !isOverride) {
            continue;
        }

        // 3. Get Slots for this day
        // TS Hack: timetable might be 'any' due to Mongoose Map dynamic nature
        const dailySlots = (timetable as any)[dayOfWeek];

        if (dailySlots && Array.isArray(dailySlots) && dailySlots.length > 0) {
            schedule.push({
                date,
                dayOfWeek,
                slots: dailySlots,
                isOverride
            });
            totalSlots += dailySlots.length;
        }
    }

    return { totalSlots, schedule };
}
