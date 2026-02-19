'use server';

import dbConnect from '@/lib/db';
import CalendarEvent, { ICalendarEvent } from '@/models/CalendarEvent';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const CreateEventSchema = z.object({
    title: z.string().min(3),
    description: z.string().optional(),
    date: z.string().or(z.date()), // Accepts ISO string or Date object
    type: z.enum(['HOLIDAY', 'EXAM', 'EVENT', 'DEADLINE']),
});

export async function createCalendarEvent(data: z.infer<typeof CreateEventSchema>) {
    try {
        await dbConnect();
        const validated = CreateEventSchema.parse(data);

        await CalendarEvent.create({
            ...validated,
            date: new Date(validated.date),
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
