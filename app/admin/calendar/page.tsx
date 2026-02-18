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

    // 1. Check Database (User Overrides/Saved Configuration)
    try {
        const calendar = await AcademicCalendar.findOne({ year }).lean();
        if (calendar && calendar.holidays && calendar.holidays.length > 0) {
            return calendar.holidays.map((h: any) => ({
                date: h.date.toISOString().split('T')[0],
                reason: h.reason
            }));
        }
    } catch (e) {
        console.warn("Database fetch failed, trying API...");
    }

    // 2. Fetch from Nager.Date API (Real-time Data)
    try {
        const response = await fetch(`https://date.nager.at/api/v3/PublicHolidays/${year}/IN`, {
            next: { revalidate: 86400 } // Cache for 24 hours
        });

        if (response.ok) {
            const apiHolidays = await response.json();
            return apiHolidays.map((h: any) => ({
                date: h.date,
                reason: h.name // e.g. "Republic Day"
            }));
        }
    } catch (error) {
        console.error("Failed to fetch holidays from API:", error);
    }

    // 3. Fallback to Static Data
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
