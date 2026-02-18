import React from 'react';
import CalendarManager from '@/components/CalendarManager';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';
import dbConnect from '@/lib/db';
import AcademicCalendar from '@/models/AcademicCalendar';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';

export const dynamic = 'force-dynamic'; // Ensure we always fetch fresh data

async function getCalendarData(year: number) {
    await dbConnect();

    const calendar = await AcademicCalendar.findOne({ year }).lean();

    if (calendar && calendar.holidays) {
        // Serialize dates to strings for client component
        return calendar.holidays.map((h: any) => ({
            date: h.date.toISOString().split('T')[0], // YYYY-MM-DD
            reason: h.reason
        }));
    }

    // Fallback to static data
    return INDIAN_HOLIDAYS_2026;
}

export default async function AdminCalendarPage() {
    const currentYear = 2026;
    const holidays = await getCalendarData(currentYear);

    return (
        <DashboardLayout role="HOD">
            <div className="mb-8">
                <SwissSubHeading className="text-primary mb-1">Configuration</SwissSubHeading>
                <SwissHeading>Academic Calendar {currentYear}</SwissHeading>
                <p className="text-muted-foreground mt-1 text-sm">
                    Manage university holidays and non-instructional days.
                </p>
            </div>

            <CalendarManager
                initialHolidays={holidays}
                year={currentYear}
            />
        </DashboardLayout>
    );
}
