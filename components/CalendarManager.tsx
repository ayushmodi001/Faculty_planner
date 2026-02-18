'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import { Layers, Loader2, Check } from 'lucide-react';
import { saveCalendar } from '@/app/actions/calendar';
import { Button, SwissHeading, SwissSubHeading, Card, CardContent } from '@/components/ui/SwissUI';
import { Toaster, toast } from 'sonner';

interface Props {
    initialHolidays: { date: string; reason: string }[];
    year: number;
}

export default function CalendarManager({ initialHolidays, year }: Props) {
    // Convert string dates to Date objects for the calendar component
    const [holidays, setHolidays] = useState<{ date: Date; reason: string }[]>(
        initialHolidays.map(h => ({ date: new Date(h.date), reason: h.reason }))
    );

    const [isSaving, setIsSaving] = useState(false);

    const toggleHoliday = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const existingIndex = holidays.findIndex(h => h.date.toISOString().split('T')[0] === dateStr);

        if (existingIndex >= 0) {
            const newHolidays = [...holidays];
            newHolidays.splice(existingIndex, 1);
            setHolidays(newHolidays);
        } else {
            const reason = prompt('Enter holiday reason:', 'University Holiday');
            if (reason) {
                setHolidays([...holidays, { date, reason }]);
            }
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        // Convert back to string format for server action
        const payload = holidays.map(h => ({
            date: h.date.toISOString().split('T')[0],
            reason: h.reason
        }));

        try {
            await saveCalendar(year, payload);
            toast.success('Academic Calendar Saved', {
                description: 'Holiday configuration has been updated successfully.',
                duration: 3000,
            });
        } catch (error) {
            toast.error('Save Failed', { description: 'Could not update calendar.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" />

            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto p-6 md:px-8 flex items-center justify-between">
                    <div>
                        <SwissSubHeading className="text-primary mb-1">Configuration</SwissSubHeading>
                        <SwissHeading className="text-3xl">Academic Calendar {year}</SwissHeading>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Define holidays and non-instructional days for the semester.
                        </p>
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="gap-2 min-w-[140px]"
                    >
                        {isSaving ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Layers className="w-4 h-4" />
                        )}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </Button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 md:p-8">
                <Calendar
                    holidays={holidays}
                    onDateClick={toggleHoliday}
                    year={year}
                />

                <div className="mt-8 flex justify-center">
                    <Card className="inline-flex bg-muted/30 border-dashed">
                        <CardContent className="py-3 px-6 text-sm text-muted-foreground flex items-center gap-2">
                            <div className="w-3 h-3 bg-red-100 border border-red-200 rounded-sm"></div> Indicates Holiday
                            <span className="mx-2">•</span>
                            Click on any date to toggle status
                        </CardContent>
                    </Card>
                </div>
            </main>
        </div>
    );
}
