'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createCalendarEvent, getCalendarEvents, deleteCalendarEvent, updateCalendarEvent } from '@/app/actions/calendar';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, CalendarRange, Edit, ChevronRight, Hash, Send, Clock, Sparkles, CalendarDays } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface CalendarInterfaceProps {
    readOnly?: boolean;
}

export default function CalendarInterface({ readOnly = false }: CalendarInterfaceProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [viewingEvent, setViewingEvent] = useState<any | null>(null);

    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'EVENT',
        description: '',
        endDate: ''
    });

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setIsLoading(true);
        const data = await getCalendarEvents();
        setEvents(data);
        setIsLoading(false);
    };

    const handleSaveEvent = async () => {
        if (!date || !newEvent.title) return;
        try {
            if (editingId) {
                await updateCalendarEvent(editingId, {
                    ...newEvent,
                    date: date,
                    endDate: newEvent.endDate ? new Date(newEvent.endDate) : undefined,
                    type: newEvent.type as any
                });
                toast.success('Event updated');
            } else {
                await createCalendarEvent({
                    ...newEvent,
                    date: date,
                    endDate: newEvent.endDate ? new Date(newEvent.endDate) : undefined,
                    type: newEvent.type as any
                });
                toast.success('Event created');
            }
            setIsDialogOpen(false);
            setNewEvent({ title: '', type: 'EVENT', description: '', endDate: '' });
            setEditingId(null);
            loadEvents();
        } catch (error) {
            toast.error('Failed to save event');
        }
    };

    const handleEditClick = (event: any) => {
        setNewEvent({
            title: event.title,
            type: event.type,
            description: event.description || '',
            endDate: event.endDate ? new Date(event.endDate).toISOString().split('T')[0] : ''
        });
        setEditingId(event._id);
        setIsDialogOpen(true);
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Are you sure you want to delete this event?')) {
            await deleteCalendarEvent(id);
            setViewingEvent(null);
            loadEvents();
            toast.success('Event deleted');
        }
    };

    const isDateInRange = (d: Date, startStr: string, endStr?: string) => {
        const target = new Date(d).setHours(0, 0, 0, 0);
        const start = new Date(startStr).setHours(0, 0, 0, 0);
        if (endStr) {
            const end = new Date(endStr).setHours(0, 0, 0, 0);
            return target >= start && target <= end;
        }
        return target === start;
    };

    const monthEvents = events.filter(e => {
        const eDate = new Date(e.date);
        const eEndDate = e.endDate ? new Date(e.endDate) : eDate;
        return (
            (eDate.getMonth() === currentMonth.getMonth() && eDate.getFullYear() === currentMonth.getFullYear()) ||
            (eEndDate.getMonth() === currentMonth.getMonth() && eEndDate.getFullYear() === currentMonth.getFullYear())
        );
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const isHoliday = (d: Date) => events.some(e => e.type === 'HOLIDAY' && isDateInRange(d, e.date, e.endDate));
    const isExam = (d: Date) => events.some(e => e.type === 'EXAM' && isDateInRange(d, e.date, e.endDate));
    const isDeadline = (d: Date) => events.some(e => e.type === 'DEADLINE' && isDateInRange(d, e.date, e.endDate));
    const isGeneralEvent = (d: Date) => events.some(e => e.type === 'EVENT' && isDateInRange(d, e.date, e.endDate));

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Calendar Main Section */}
            <div className="lg:col-span-8">
                <Card className="shadow-sm border-slate-200 h-full overflow-hidden">
                    <CardHeader className="bg-slate-50 border-b py-5 px-8">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-100">
                                <CalendarDays className="w-5 h-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-bold text-slate-900">Academic Calendar</CardTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Plan & Schedule</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8">
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            className="w-full flex justify-center py-6"
                            classNames={{
                                head_cell: "text-slate-400 font-bold text-[10px] uppercase tracking-wider",
                                day: "h-11 w-11 hover:bg-slate-50 hover:text-blue-600 font-bold rounded-xl transition-all",
                                day_selected: "bg-blue-600 text-white hover:bg-blue-700 hover:text-white shadow-md",
                                day_today: "border-2 border-blue-100 text-blue-600 font-bold"
                            }}
                            modifiers={{
                                holiday: isHoliday,
                                exam: isExam,
                                deadline: isDeadline,
                                event: isGeneralEvent
                            }}
                            modifiersStyles={{
                                holiday: { backgroundColor: '#fee2e2', borderRadius: '10px', color: '#ef4444' },
                                exam: { backgroundColor: '#fef9c3', borderRadius: '10px', color: '#a16207' },
                                deadline: { backgroundColor: '#ffedd5', borderRadius: '10px', color: '#ea580c' },
                                event: { backgroundColor: '#dbeafe', borderRadius: '10px', color: '#2563eb' }
                            }}
                        />

                        <div className="flex flex-wrap gap-8 mt-10 justify-center border-t pt-8">
                            <LegendItem color="bg-red-400" label="Holiday" />
                            <LegendItem color="bg-yellow-400" label="Examination" />
                            <LegendItem color="bg-orange-400" label="Deadline" />
                            <LegendItem color="bg-blue-400" label="General" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Sidebar with Events */}
            <div className="lg:col-span-4 space-y-6 flex flex-col">
                <Card className="shadow-sm border-slate-200 flex-1 flex flex-col overflow-hidden">
                    <CardHeader className="py-6 px-8">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Upcoming Events</p>
                        <CardTitle className="text-2xl font-bold text-slate-900">
                            {format(currentMonth, 'MMMM yyyy')}
                        </CardTitle>
                    </CardHeader>

                    <CardContent className="px-6 flex-1 space-y-3 overflow-y-auto">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 gap-4">
                                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
                                <p className="text-[10px] font-bold text-slate-400 uppercase">Loading events...</p>
                            </div>
                        ) : monthEvents.length > 0 ? (
                            <div className="space-y-3">
                                {monthEvents.map(event => (
                                    <div
                                        key={event._id}
                                        className="group p-4 bg-slate-50 hover:bg-blue-50/50 border border-slate-100 hover:border-blue-100 rounded-2xl cursor-pointer transition-all"
                                        onClick={() => setViewingEvent(event)}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors uppercase tracking-tight">{event.title}</div>
                                            <Badge variant="secondary" className={cn("rounded-md text-[8px] font-bold uppercase tracking-tight h-5 px-2",
                                                event.type === 'HOLIDAY' ? 'bg-red-50 text-red-600 border-red-100' :
                                                    event.type === 'EXAM' ? 'bg-yellow-50 text-yellow-700 border-yellow-100' :
                                                        event.type === 'DEADLINE' ? 'bg-orange-50 text-orange-600 border-orange-100' : 'bg-blue-50 text-blue-600 border-blue-100')}>
                                                {event.type}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                            <Clock className="w-3 h-3" />
                                            {format(new Date(event.date), 'MMM d')}
                                            {event.endDate && event.endDate !== event.date && ` — ${format(new Date(event.endDate), 'MMM d')}`}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 text-center rounded-2xl border-2 border-dashed border-slate-100 bg-slate-50/50 space-y-2">
                                <Sparkles className="w-8 h-8 text-slate-200 mx-auto" />
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No events scheduled</p>
                            </div>
                        )}
                    </CardContent>

                    {!readOnly && date && (
                        <div className="p-6 pt-0 mt-4">
                            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (!open) {
                                    setEditingId(null);
                                    setNewEvent({ title: '', type: 'EVENT', description: '', endDate: '' });
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="w-full h-12 font-bold uppercase tracking-wider text-xs gap-2 shadow-sm">
                                        <Plus className="w-4 h-4" /> Add Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-md">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-bold">{editingId ? 'Edit Event' : 'New Event'}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 pt-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Title</label>
                                            <Input
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                placeholder="e.g. Mid-term Exams"
                                                className="font-bold"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Start Date</label>
                                                <Input value={format(date, 'MMM d, yyyy')} disabled className="bg-slate-50 font-medium" />
                                            </div>
                                            <div className="space-y-1">
                                                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">End Date (Optional)</label>
                                                <Input
                                                    type="date"
                                                    min={date.toISOString().split('T')[0]}
                                                    value={newEvent.endDate}
                                                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                                    className="font-medium"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Event Category</label>
                                            <Select
                                                value={newEvent.type}
                                                onValueChange={(val) => setNewEvent({ ...newEvent, type: val })}
                                            >
                                                <SelectTrigger className="font-bold">
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EVENT">General Event</SelectItem>
                                                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                                    <SelectItem value="EXAM">Examination</SelectItem>
                                                    <SelectItem value="DEADLINE">Academic Deadline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleSaveEvent} className="w-full h-11 font-bold uppercase tracking-wider text-xs mt-4">
                                            {editingId ? 'Save Changes' : 'Create Event'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                    )}
                </Card>
            </div>

            {/* Event Details Viewer */}
            <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
                <DialogContent className="max-w-md">
                    <div className="space-y-6 pt-4">
                        <div className="flex justify-between items-start">
                            <div className="space-y-1">
                                <DialogTitle className="text-2xl font-bold text-slate-900 uppercase tracking-tight leading-tight">{viewingEvent?.title}</DialogTitle>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{viewingEvent?.type}</p>
                            </div>
                            <Badge variant="secondary" className={cn("rounded-md px-3 py-1",
                                viewingEvent?.type === 'HOLIDAY' ? 'bg-red-50 text-red-600' :
                                    viewingEvent?.type === 'EXAM' ? 'bg-yellow-50 text-yellow-700' :
                                        viewingEvent?.type === 'DEADLINE' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600')}>
                                {viewingEvent?.type}
                            </Badge>
                        </div>

                        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-4">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-blue-600 border">
                                    <Clock className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">Scheduled Date</p>
                                    <p className="font-bold text-slate-900 text-sm">
                                        {viewingEvent && format(new Date(viewingEvent.date), 'EEEE, MMMM do')}
                                        {viewingEvent?.endDate && viewingEvent.endDate !== viewingEvent.date && (
                                            <> <span className="mx-2 text-slate-300">—</span> {format(new Date(viewingEvent.endDate), 'EEEE, MMMM do')}</>
                                        )}
                                    </p>
                                </div>
                            </div>

                            {viewingEvent?.description && (
                                <div className="pt-4 border-t border-slate-200">
                                    <p className="text-[9px] font-bold text-slate-400 uppercase mb-1">Description</p>
                                    <p className="text-sm font-medium text-slate-600 italic">{viewingEvent.description}</p>
                                </div>
                            )}
                        </div>

                        {!readOnly && (
                            <div className="flex gap-3">
                                <Button variant="outline" className="flex-1 h-11 font-bold uppercase tracking-wider text-xs" onClick={() => {
                                    handleEditClick(viewingEvent);
                                    setViewingEvent(null);
                                }}>
                                    <Edit className="w-4 h-4 mr-2" /> Edit
                                </Button>
                                <Button variant="destructive" className="flex-1 h-11 font-bold uppercase tracking-wider text-xs" onClick={() => handleDeleteEvent(viewingEvent._id)}>
                                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                                </Button>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}

function LegendItem({ color, label }: any) {
    return (
        <div className="flex items-center gap-2">
            <div className={cn("w-3 h-3 rounded-full", color)} />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{label}</span>
        </div>
    );
}
