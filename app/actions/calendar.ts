'use server';

import dbConnect from '@/lib/db';
import AcademicCalendar from '@/models/AcademicCalendar';
import { revalidatePath } from 'next/cache';

export async function saveCalendar(year: number, holidays: { date: string; reason: string }[]) {
    try {
        await dbConnect();

        // Upsert the calendar for the given year
        await AcademicCalendar.findOneAndUpdate(
            { year },
            {
                year,
                holidays: holidays.map(h => ({
                    date: new Date(h.date),
                    reason: h.reason
                }))
            },
            { upsert: true, new: true }
        );

        revalidatePath('/admin/calendar');
        return { success: true };
    } catch (error) {
        console.error('Error saving calendar:', error);
        return { success: false, error: 'Failed to save calendar' };
    }
}
