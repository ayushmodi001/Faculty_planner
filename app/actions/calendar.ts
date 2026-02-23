'use server';

import dbConnect from '@/lib/db';
import CalendarEvent, { ICalendarEvent } from '@/models/CalendarEvent';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateEventSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().or(z.date()), // Accepts ISO string or Date object
    endDate: z.string().or(z.date()).optional(),
    type: z.enum(['HOLIDAY', 'EXAM', 'EVENT', 'DEADLINE']),
});

export async function createCalendarEvent(data: z.infer<typeof CreateEventSchema>) {
    try {
        await dbConnect();
        const validated = CreateEventSchema.parse(data);

        await CalendarEvent.create({
            ...validated,
            date: new Date(validated.date),
            endDate: validated.endDate ? new Date(validated.endDate) : undefined,
        });

        revalidatePath('/admin/calendar');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to create event' };
    }
}

export async function getCalendarEvents() {
    try {
        await dbConnect();
        const events = await CalendarEvent.find().sort({ date: 1 }).lean();
        return JSON.parse(JSON.stringify(events));
    } catch (error) {
        return [];
    }
}

export async function updateCalendarEvent(id: string, data: any) {
    try {
        await dbConnect();
        const updateData: any = { ...data };
        if (updateData.date) updateData.date = new Date(updateData.date);
        if (updateData.endDate) updateData.endDate = new Date(updateData.endDate);

        await CalendarEvent.findByIdAndUpdate(id, updateData);
        revalidatePath('/admin/calendar');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to update event' };
    }
}

export async function deleteCalendarEvent(id: string) {
    try {
        await dbConnect();
        await CalendarEvent.findByIdAndDelete(id);
        revalidatePath('/admin/calendar');
        return { success: true };
    } catch (error) {
        return { success: false, error: 'Failed to delete event' };
    }
}

import AcademicCalendar from '@/models/AcademicCalendar';

export async function saveCalendar(year: number, holidays: { date: string, reason: string }[]) {
    try {
        await dbConnect();

        const datesFormatted = holidays.map(h => ({
            date: new Date(h.date),
            reason: h.reason
        }));

        await AcademicCalendar.findOneAndUpdate(
            { year },
            { holidays: datesFormatted },
            { new: true, upsert: true }
        );

        revalidatePath('/admin/calendar');
        return { success: true };
    } catch (error: any) {
        return { success: false, error: error.message };
    }
}
