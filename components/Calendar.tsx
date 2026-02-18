'use client';

import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    setMonth,
    setYear,
    getDay,
} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/SwissUI';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CalendarProps {
    holidays: { date: Date; reason: string }[];
    onDateClick: (date: Date) => void;
    year: number;
}

const MonthView = ({
    monthDate,
    holidays,
    onDateClick
}: {
    monthDate: Date;
    holidays: { date: Date; reason: string }[];
    onDateClick: (date: Date) => void;
}) => {
    const firstDayOfMonth = startOfMonth(monthDate);
    const lastDayOfMonth = endOfMonth(monthDate);

    // Get the day of the week the month starts on (0=Sun, 1=Mon...)
    const startDayOfWeek = getDay(firstDayOfMonth);

    // Create padding days for the correct grid alignment
    const paddingDays = Array.from({ length: startDayOfWeek });

    const daysInMonth = eachDayOfInterval({ start: firstDayOfMonth, end: lastDayOfMonth });

    const isHoliday = (date: Date) => {
        return holidays.find((h) => isSameDay(h.date, date));
    };

    return (
        <div className="bg-card border border-border rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
            <h3 className="text-lg font-bold text-foreground mb-4 text-center border-b pb-2">
                {format(monthDate, 'MMMM')}
            </h3>

            <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => (
                    <div key={day} className={cn(
                        "text-xs font-bold text-muted-foreground",
                        (i === 0 || i === 6) && "text-destructive/70" // Red for weekends
                    )}>
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {paddingDays.map((_, i) => (
                    <div key={`padding-${i}`} className="aspect-square" />
                ))}

                {daysInMonth.map((day) => {
                    const holiday = isHoliday(day);
                    const isToday = isSameDay(day, new Date());
                    const isWeekend = getDay(day) === 0 || getDay(day) === 6;

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDateClick(day)}
                            title={holiday ? holiday.reason : format(day, 'yyyy-MM-dd')}
                            className={cn(
                                'aspect-square flex items-center justify-center rounded-md cursor-pointer text-sm font-medium transition-colors relative group',
                                'hover:bg-accent hover:text-accent-foreground',
                                isToday && 'ring-2 ring-primary ring-offset-1 z-10',
                                holiday
                                    ? 'bg-red-100 text-red-700 font-bold border border-red-200'
                                    : isWeekend ? 'text-muted-foreground bg-muted/20' : 'text-foreground bg-background'
                            )}
                        >
                            {format(day, 'd')}
                            {holiday && (
                                <div className="hidden group-hover:block absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-popover text-popover-foreground text-xs rounded shadow-lg border border-border whitespace-nowrap z-20">
                                    {holiday.reason}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

const Calendar: React.FC<CalendarProps> = ({ holidays, onDateClick, year }) => {
    // Generate dates for all 12 months of the given year
    const months = Array.from({ length: 12 }, (_, i) => setMonth(setYear(new Date(), year), i));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {months.map((month) => (
                <MonthView
                    key={month.toISOString()}
                    monthDate={month}
                    holidays={holidays}
                    onDateClick={onDateClick}
                />
            ))}
        </div>
    );
};

export default Calendar;
