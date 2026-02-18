'use client';

import React, { useState } from 'react';
import Calendar from './Calendar';
import { Layers, CheckCircle, Loader2 } from 'lucide-react';
import { saveCalendar } from '@/app/actions/calendar';

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

        await saveCalendar(year, payload);
        setIsSaving(false);
        alert('Calendar saved successfully!');
    };

    return (
        <div className="min-h-screen p-8 text-white">
            <header className="mb-12 flex items-center justify-between max-w-5xl mx-auto">
                <div>
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Academic Calendar {year}
                    </h1>
                    <p className="text-gray-400 mt-2">Manage university holidays and working days.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                    >
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </header>

            <main>
                <Calendar
                    holidays={holidays}
                    onDateClick={toggleHoliday}
                />

                <div className="mt-8 max-w-4xl mx-auto text-sm text-gray-500 text-center">
                    <p>Click on any date to toggle it as a holiday.</p>
                </div>
            </main>
        </div>
    );
}
