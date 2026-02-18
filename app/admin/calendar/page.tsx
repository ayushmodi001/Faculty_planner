'use client';

import React, { useState } from 'react';
import Calendar from '@/components/Calendar';
import { INDIAN_HOLIDAYS_2026 } from '@/data/indian_holidays';
import { Layers } from 'lucide-react';

export default function AdminCalendarPage() {
    // Convert static holidays to Date objects for the legitimate format
    const initialHolidays = INDIAN_HOLIDAYS_2026.map(h => ({
        date: new Date(h.date),
        reason: h.reason
    }));

    const [holidays, setHolidays] = useState(initialHolidays);

    const toggleHoliday = (date: Date) => {
        // Check if it's already a holiday
        const dateStr = date.toISOString().split('T')[0];
        const existingIndex = holidays.findIndex(h => h.date.toISOString().split('T')[0] === dateStr);

        if (existingIndex >= 0) {
            // Remove holiday
            const newHolidays = [...holidays];
            newHolidays.splice(existingIndex, 1);
            setHolidays(newHolidays);
        } else {
            // Add holiday (default reason)
            // In a real app, we would prompt for a reason
            const reason = prompt('Enter holiday reason:', 'University Holiday');
            if (reason) {
                setHolidays([...holidays, { date, reason }]);
            }
        }
    };

    return (
        <div className="min-h-screen p-8 text-white">
            <header className="mb-12 flex items-center justify-between max-w-5xl mx-auto">
                <div>
                    <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
                        Academic Calendar
                    </h1>
                    <p className="text-gray-400 mt-2">Manage university holidays and working days.</p>
                </div>
                <div className="flex gap-4">
                    <button
                        className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-full font-medium transition-all shadow-lg hover:shadow-blue-500/25"
                        onClick={() => alert('Save functionality coming in Step 9!')}
                    >
                        <Layers className="w-4 h-4" />
                        Save Changes
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
