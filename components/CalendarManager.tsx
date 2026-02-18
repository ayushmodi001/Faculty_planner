'use client';

import React, { useState } from 'react';
import { Layers, Loader2, Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';
import { saveCalendar } from '@/app/actions/calendar';
import { Toaster, toast } from 'sonner';
import { Calendar } from "@/components/ui/calendar"
import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog"

interface Props {
    initialHolidays: { date: string; reason: string }[];
    year: number;
}

export default function CalendarManager({ initialHolidays, year }: Props) {
    const [holidays, setHolidays] = useState<{ date: Date; reason: string }[]>(
        initialHolidays.map(h => ({ date: new Date(h.date), reason: h.reason }))
    );
    const [date, setDate] = useState<Date | undefined>(undefined);
    const [isSaving, setIsSaving] = useState(false);
    const [reasonInput, setReasonInput] = useState("");

    // Dialog States
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

    // Selected holiday check
    const selectedHoliday = date ? holidays.find(h => h.date.toDateString() === date.toDateString()) : undefined;

    const handleDateSelect = (selectedDate: Date | undefined) => {
        if (!selectedDate) return;
        setDate(selectedDate);

        // check if holiday exists
        const existing = holidays.find(h => h.date.toDateString() === selectedDate.toDateString());
        if (existing) {
            setIsRemoveDialogOpen(true);
        } else {
            setReasonInput(""); // reset input
            setIsAddDialogOpen(true);
        }
    };

    const confirmAddHoliday = () => {
        if (!date || !reasonInput.trim()) return;
        setHolidays([...holidays, { date, reason: reasonInput }]);
        setIsAddDialogOpen(false);
        toast.success("Holiday Added", { description: `${reasonInput} on ${format(date, 'PPP')}` });
    };

    const confirmRemoveHoliday = () => {
        if (!date) return;
        setHolidays(holidays.filter(h => h.date.toDateString() !== date.toDateString()));
        setIsRemoveDialogOpen(false);
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
            toast.success('Configuration Saved', { description: 'Academic calendar updated successfully.' });
        } catch (error) {
            toast.error('Save Failed', { description: 'Could not write to database.' });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50/50">
            <Toaster position="top-center" richColors />

            {/* Top Bar */}
            <div className="sticky top-0 z-30 w-full border-b bg-white/80 backdrop-blur-md px-8 py-4 flex items-center justify-between shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                        Academic Calendar {year}
                    </h1>
                    <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">
                        Global Configuration
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="rounded-full bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200"
                >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Layers className="w-4 h-4 mr-2" />}
                    {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
            </div>

            <main className="max-w-6xl mx-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">

                {/* Calendar Section */}
                <div className="lg:col-span-8">
                    <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden relative">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                        <div className="p-6">
                            <Calendar
                                mode="single"
                                selected={date}
                                onSelect={handleDateSelect}
                                className="w-full pointer-events-auto"
                                numberOfMonths={2}
                                defaultMonth={new Date(year, 0)}
                                modifiers={{
                                    holiday: holidays.map(h => h.date)
                                }}
                                modifiersClassNames={{
                                    holiday: "bg-red-50 text-red-600 font-bold border-2 border-red-100 hover:bg-red-100 hover:border-red-200 rounded-md"
                                }}
                                classNames={{
                                    month: "space-y-4 w-full",
                                    caption: "flex justify-center pt-1 relative items-center mb-4",
                                    caption_label: "text-lg font-bold text-slate-700",
                                    head_cell: "text-muted-foreground rounded-md w-12 font-normal text-[0.8rem] uppercase tracking-wider",
                                    cell: "h-12 w-12 text-center text-sm p-0 flex items-center justify-center relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
                                    day: "h-12 w-12 p-0 font-normal aria-selected:opacity-100 hover:bg-slate-100 rounded-lg transition-all duration-200",
                                    day_selected: "bg-indigo-600 text-white hover:bg-indigo-600 focus:bg-indigo-600",
                                    day_today: "bg-slate-100 text-slate-900 font-bold ring-2 ring-indigo-200",
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Sidebar / List Section */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-white rounded-xl shadow-sm border p-4">
                        <h3 className="font-semibold text-slate-800 mb-4 flex items-center">
                            <CalendarIcon className="w-4 h-4 mr-2 text-indigo-500" />
                            Configured Holidays
                            <span className="ml-auto bg-slate-100 text-slate-600 text-xs px-2 py-1 rounded-full">{holidays.length}</span>
                        </h3>

                        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                            {holidays.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8 italic">No holidays added yet.</p>
                            )}
                            {holidays.sort((a, b) => a.date.getTime() - b.date.getTime()).map((h, i) => (
                                <div key={i} className="group flex items-start p-3 bg-slate-50 hover:bg-white border hover:border-indigo-200 rounded-lg transition-all duration-200 hover:shadow-md cursor-default">
                                    <div className="flex-shrink-0 w-10 text-center mr-3">
                                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{format(h.date, 'MMM')}</div>
                                        <div className="text-lg font-bold text-slate-700 leading-none">{format(h.date, 'd')}</div>
                                    </div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-medium text-slate-800 group-hover:text-indigo-700 transition-colors">{h.reason}</p>
                                        <p className="text-xs text-slate-400">{format(h.date, 'EEEE')}</p>
                                    </div>
                                    <button
                                        onClick={() => { setDate(h.date); setIsRemoveDialogOpen(true); }}
                                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </main>

            {/* ADD COMPONENT: Alert Dialog for Adding */}
            <AlertDialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <AlertDialogContent className="sm:max-w-[425px]">
                    <AlertDialogHeader>
                        <AlertDialogTitle>Mark Holiday</AlertDialogTitle>
                        <AlertDialogDescription>
                            Set <span className="font-bold text-foreground">{date ? format(date, 'PPPP') : ''}</span> as a non-instructional day?
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid gap-2">
                            <label htmlFor="reason" className="text-sm font-medium">Holiday Reason</label>
                            <input
                                id="reason"
                                autoFocus
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                placeholder="e.g. Independence Day"
                                value={reasonInput}
                                onChange={(e) => setReasonInput(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && confirmAddHoliday()}
                            />
                        </div>
                    </div>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmAddHoliday} className="bg-indigo-600 hover:bg-indigo-700">Add Holiday</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* REMOVE COMPONENT: Alert Dialog for Removing */}
            <AlertDialog open={isRemoveDialogOpen} onOpenChange={setIsRemoveDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Remove Holiday?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to remove <span className="font-bold text-foreground">{selectedHoliday?.reason}</span> on {date ? format(date, 'PPPP') : ''}?
                            This will make it a working instructional day.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={confirmRemoveHoliday} className="bg-red-600 hover:bg-red-700">Remove</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

        </div>
    );
}
