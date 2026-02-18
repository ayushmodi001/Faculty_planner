'use client';

import React, { useState } from 'react';
import { Layers, Loader2, Calendar as CalendarIcon, X } from 'lucide-react';
import { saveCalendar } from '@/app/actions/calendar';
import { Toaster, toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "@/components/ui/button"
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface Props {
    initialHolidays: { date: string; reason: string }[];
    year: number;
}

export default function CalendarManager({ initialHolidays, year }: Props) {
    const [holidays, setHolidays] = useState<{ date: Date; reason: string }[]>(
        initialHolidays.map(h => ({ date: new Date(h.date), reason: h.reason }))
    );
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [isSaving, setIsSaving] = useState(false);
    const [reasonInput, setReasonInput] = useState("");
    const [isPopoverOpen, setIsPopoverOpen] = useState(false);

    // Check if the selected date is already a holiday
    const selectedHoliday = date ? holidays.find(h => h.date.toDateString() === date.toDateString()) : undefined;

    const handleAddHoliday = () => {
        if (!date || !reasonInput.trim()) return;
        setHolidays([...holidays, { date, reason: reasonInput }]);
        setReasonInput("");
        setIsPopoverOpen(false);
        toast.success("Holiday Added", { description: `${format(date, 'PPP')} marked as ${reasonInput}` });
    };

    const handleRemoveHoliday = () => {
        if (!date) return;
        setHolidays(holidays.filter(h => h.date.toDateString() !== date.toDateString()));
        setIsPopoverOpen(false);
        toast.info("Holiday Removed", { description: `${format(date, 'PPP')} is now a working day` });
    };

    const handleSave = async () => {
        setIsSaving(true);
        const payload = holidays.map(h => ({
            date: h.date.toISOString().split('T')[0],
            reason: h.reason
        }));

        try {
            await saveCalendar(year, payload);
            toast.success('Calendar Saved', { description: 'All changes have been persisted to the database.' });
        } catch (error) {
            toast.error('Save Failed', { description: 'Could not update calendar.' });
        } finally {
            setIsSaving(false);
        }
    };

    // Custom modifiers for the calendar
    const holidayDates = holidays.map(h => h.date);

    return (
        <div className="min-h-screen bg-background">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="border-b bg-card">
                <div className="max-w-7xl mx-auto p-6 md:px-8 flex items-center justify-between">
                    <div>
                        <SwissSubHeading className="text-primary mb-1">Globale Configuration</SwissSubHeading>
                        <SwissHeading className="text-3xl">Academic Calendar {year}</SwissHeading>
                        <p className="text-muted-foreground mt-1 text-sm">
                            {(holidays.length)} holidays configured for this academic session.
                        </p>
                    </div>
                    <Button onClick={handleSave} disabled={isSaving} className="gap-2">
                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Layers className="w-4 h-4" />}
                        {isSaving ? 'Saving...' : 'Save Configuration'}
                    </Button>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-8 flex flex-col items-center">

                <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                        <div className="bg-card border rounded-xl shadow-sm p-4">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={(d) => { setDate(d); setIsPopoverOpen(true); }}
                                className="rounded-md border shadow"
                                numberOfMonths={2}
                                defaultMonth={new Date(year, 0)}
                                modifiers={{
                                    holiday: holidayDates
                                }}
                                modifiersClassNames={{
                                    holiday: "bg-red-100 text-red-600 font-bold hover:bg-red-200 hover:text-red-700"
                                }}
                            />
                        </div>
                    </PopoverTrigger>
                    <PopoverContent className="w-80 p-0" align="start">
                        <div className="p-4 space-y-4">
                            <div className="space-y-2">
                                <h4 className="font-medium leading-none">
                                    {date ? format(date, 'PPP') : 'Select a date'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                    {selectedHoliday
                                        ? "This date is currently marked as a holiday."
                                        : "Mark this date as a non-instructional holiday."}
                                </p>
                            </div>

                            {selectedHoliday ? (
                                <div className="bg-muted p-3 rounded-md text-sm mb-2 flex justify-between items-center">
                                    <span className="font-medium">{selectedHoliday.reason}</span>
                                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={handleRemoveHoliday}>
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <div className="grid gap-2">
                                    <div className="grid grid-cols-3 items-center gap-4">
                                        <label htmlFor="reason" className="text-sm font-medium">Reason</label>
                                        <input
                                            id="reason"
                                            value={reasonInput}
                                            onChange={(e) => setReasonInput(e.target.value)}
                                            className="col-span-2 h-8 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                            placeholder="e.g. Diwali"
                                        />
                                    </div>
                                    <Button size="sm" onClick={handleAddHoliday}>Add Holiday</Button>
                                </div>
                            )}
                        </div>
                    </PopoverContent>
                </Popover>

                <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                    {holidays.sort((a, b) => a.date.getTime() - b.date.getTime()).map((h, i) => (
                        <div key={i} className="flex items-center p-3 border rounded-lg bg-card shadow-sm">
                            <div className="flex-col flex items-center justify-center h-12 w-12 rounded-md bg-red-50 text-red-600 border border-red-100 mr-4">
                                <span className="text-xs font-bold uppercase">{format(h.date, 'MMM')}</span>
                                <span className="text-lg font-bold leading-none">{format(h.date, 'd')}</span>
                            </div>
                            <div>
                                <p className="font-medium">{h.reason}</p>
                                <p className="text-xs text-muted-foreground">{format(h.date, 'EEEE')}</p>
                            </div>
                        </div>
                    ))}
                </div>

            </main>
        </div>
    );
}
