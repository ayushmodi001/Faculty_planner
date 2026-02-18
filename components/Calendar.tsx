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
} from 'date-fns';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ChevronLeft, ChevronRight } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface CalendarProps {
    holidays: { date: Date; reason: string }[];
    onDateClick: (date: Date) => void;
}

const Calendar: React.FC<CalendarProps> = ({ holidays, onDateClick }) => {
    const [currentDate, setCurrentDate] = useState(new Date());

    const firstDay = startOfMonth(currentDate);
    const lastDay = endOfMonth(currentDate);
    const daysInMonth = eachDayOfInterval({ start: firstDay, end: lastDay });

    const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    const isHoliday = (date: Date) => {
        return holidays.find((h) => isSameDay(h.date, date));
    };

    return (
        <div className="p-6 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-xl max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-3xl font-bold text-white tracking-tight">
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-2">
                    <button
                        onClick={prevMonth}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <button
                        onClick={nextMonth}
                        className="p-2 rounded-full hover:bg-white/10 transition-colors text-white"
                    >
                        <ChevronRight className="w-6 h-6" />
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-4 text-center mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                    <div key={day} className="font-semibold text-gray-300 uppercase text-sm tracking-wider">
                        {day}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-4">
                {daysInMonth.map((day) => {
                    const holiday = isHoliday(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                        <div
                            key={day.toISOString()}
                            onClick={() => onDateClick(day)}
                            className={cn(
                                'aspect-square flex flex-col items-center justify-center rounded-xl cursor-pointer transition-all duration-200 border border-transparent',
                                'hover:scale-105 hover:shadow-lg hover:border-white/20',
                                !isSameMonth(day, currentDate) && 'opacity-30',
                                holiday
                                    ? 'bg-red-500/20 text-red-200 border-red-500/30'
                                    : 'bg-white/5 text-gray-200 hover:bg-white/10',
                                isToday && 'ring-2 ring-blue-500 ring-offset-2 ring-offset-transparent bg-blue-500/20'
                            )}
                        >
                            <span className="text-lg font-medium">{format(day, 'd')}</span>
                            {holiday && (
                                <span className="text-[10px] mt-1 px-1 text-center leading-tight opacity-80 truncate w-full">
                                    {holiday.reason}
                                </span>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Calendar;
