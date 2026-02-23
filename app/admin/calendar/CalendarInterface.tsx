'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui/SwissUI';
import { createCalendarEvent, getCalendarEvents, deleteCalendarEvent, updateCalendarEvent } from '@/app/actions/calendar';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, CalendarRange, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

    // New Event State
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
                toast.success('Event Updated');
            } else {
                await createCalendarEvent({
                    ...newEvent,
                    date: date,
                    endDate: newEvent.endDate ? new Date(newEvent.endDate) : undefined,
                    type: newEvent.type as any
                });
                toast.success('Event Added');
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
        // We keep the calendar selection as is, or update it?
        // Updating calendar selection might be confusing if editing event on different day.
        // But for simplicity, let's assume user clicked on the day.
        // Actually, the list only shows events for selected date. So date is already correct.
        setEditingId(event._id);
        setIsDialogOpen(true);
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Delete this event?')) {
            await deleteCalendarEvent(id);
            setViewingEvent(null);
            loadEvents();
            toast.success('Event Deleted');
        }
    };

    // Date range helper
    const isDateInRange = (d: Date, startStr: string, endStr?: string) => {
        const target = new Date(d).setHours(0, 0, 0, 0);
        const start = new Date(startStr).setHours(0, 0, 0, 0);
        if (endStr) {
            const end = new Date(endStr).setHours(0, 0, 0, 0);
            return target >= start && target <= end;
        }
        return target === start;
    };

    // Filter events for the currently viewed month
    const monthEvents = events.filter(e => {
        const eDate = new Date(e.date);
        const eEndDate = e.endDate ? new Date(e.endDate) : eDate;
        return (
            (eDate.getMonth() === currentMonth.getMonth() && eDate.getFullYear() === currentMonth.getFullYear()) ||
            (eEndDate.getMonth() === currentMonth.getMonth() && eEndDate.getFullYear() === currentMonth.getFullYear())
        );
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // Generate modifiers
    const isHoliday = (d: Date) => events.some(e => e.type === 'HOLIDAY' && isDateInRange(d, e.date, e.endDate));
    const isExam = (d: Date) => events.some(e => e.type === 'EXAM' && isDateInRange(d, e.date, e.endDate));
    const isDeadline = (d: Date) => events.some(e => e.type === 'DEADLINE' && isDateInRange(d, e.date, e.endDate));
    const isGeneralEvent = (d: Date) => events.some(e => e.type === 'EVENT' && isDateInRange(d, e.date, e.endDate));

    return (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            <div className="md:col-span-8">
                <Card className="h-full border-none shadow-md">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <CalendarRange className="w-5 h-5" />
                            Academic Calendar
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            month={currentMonth}
                            onMonthChange={setCurrentMonth}
                            className="rounded-md border mx-auto w-full p-6 flex justify-center scale-110 mt-6 mb-6"
                            classNames={{
                                head_cell: "text-muted-foreground w-12 font-bold text-sm",
                                cell: "text-center text-sm p-0 w-12 h-12 flex items-center justify-center",
                                day: "h-10 w-10 hover:bg-accent hover:text-accent-foreground font-medium rounded-full",
                                day_selected: "bg-primary text-primary-foreground focus:bg-primary focus:text-primary-foreground",
                            }}
                            modifiers={{
                                holiday: isHoliday,
                                exam: isExam,
                                deadline: isDeadline,
                                event: isGeneralEvent
                            }}
                            modifiersStyles={{
                                holiday: { backgroundColor: '#fee2e2', color: '#dc2626', fontWeight: 'bold' },
                                exam: { backgroundColor: '#fef08a', color: '#ca8a04', fontWeight: 'bold' },
                                deadline: { backgroundColor: '#ffedd5', color: '#ea580c', fontWeight: 'bold' },
                                event: { backgroundColor: '#dbeafe', color: '#2563eb', fontWeight: 'bold' }
                            }}
                        />
                        <div className="flex flex-wrap gap-4 mt-8 justify-center text-xs text-muted-foreground">
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#fee2e2] border border-[#dc2626]"></span> Holiday</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#fef08a] border border-[#ca8a04]"></span> Exam</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#ffedd5] border border-[#ea580c]"></span> Deadline</div>
                            <div className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[#dbeafe] border border-[#2563eb]"></span> Event</div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-4 space-y-4">
                <Card className="h-full border-none shadow-sm bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {currentMonth.toLocaleDateString(undefined, { month: 'long', year: 'numeric' })} Events
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {isLoading ? (
                            <Loader2 className="animate-spin w-8 h-8 mx-auto opacity-50" />
                        ) : monthEvents.length > 0 ? (
                            monthEvents.map(event => (
                                <div
                                    key={event._id}
                                    className="p-3 bg-background rounded-lg border shadow-sm cursor-pointer hover:border-primary transition-all group"
                                    onClick={() => setViewingEvent(event)}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <div className="font-bold text-sm tracking-tight">{event.title}</div>
                                        <Badge
                                            variant="outline"
                                            className={`text-[9px] uppercase font-bold
                                                ${event.type === 'HOLIDAY' ? 'border-red-200 text-red-600 bg-red-50' :
                                                    event.type === 'EXAM' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
                                                        event.type === 'DEADLINE' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                                                            'border-blue-200 text-blue-600 bg-blue-50'}
                                            `}
                                        >
                                            {event.type}
                                        </Badge>
                                    </div>
                                    <div className="text-xs text-muted-foreground font-mono">
                                        {new Date(event.date).toLocaleDateString()}
                                        {event.endDate && event.endDate !== event.date && ` - ${new Date(event.endDate).toLocaleDateString()}`}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-12 text-muted-foreground text-sm border-2 border-dashed rounded-lg">
                                No events scheduled for this month.
                            </div>
                        )}

                        {!readOnly && date && (
                            <Dialog open={isDialogOpen} onOpenChange={(open) => {
                                setIsDialogOpen(open);
                                if (!open) {
                                    setEditingId(null);
                                    setNewEvent({ title: '', type: 'EVENT', description: '', endDate: '' });
                                }
                            }}>
                                <DialogTrigger asChild>
                                    <Button className="w-full mt-4" variant="outline">
                                        <Plus className="w-4 h-4 mr-2" /> Add Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>{editingId ? 'Edit Event' : 'Add Event'} for {date.toLocaleDateString()}</DialogTitle>
                                    </DialogHeader>
                                    <div className="space-y-4 py-4">
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Event Title</label>
                                            <Input
                                                value={newEvent.title}
                                                onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                                                placeholder="e.g. Mid-Term Exams"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">Start Date</label>
                                                <Input value={date.toLocaleDateString()} disabled className="bg-muted" />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-sm font-medium">End Date (Optional)</label>
                                                <Input
                                                    type="date"
                                                    min={date.toISOString().split('T')[0]}
                                                    value={newEvent.endDate}
                                                    onChange={(e) => setNewEvent({ ...newEvent, endDate: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Type</label>
                                            <Select
                                                value={newEvent.type}
                                                onValueChange={(val) => setNewEvent({ ...newEvent, type: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="EVENT">General Event</SelectItem>
                                                    <SelectItem value="HOLIDAY">Holiday</SelectItem>
                                                    <SelectItem value="EXAM">Examination</SelectItem>
                                                    <SelectItem value="DEADLINE">Deadline</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <Button onClick={handleSaveEvent} className="w-full">
                                            {editingId ? 'Update Event' : 'Save Event'}
                                        </Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* View/Edit Details Dialog */}
            <Dialog open={!!viewingEvent} onOpenChange={(open) => !open && setViewingEvent(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle className="text-xl">{viewingEvent?.title}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-2">
                        <Badge
                            variant="outline"
                            className={`uppercase font-bold
                                ${viewingEvent?.type === 'HOLIDAY' ? 'border-red-200 text-red-600 bg-red-50' :
                                    viewingEvent?.type === 'EXAM' ? 'border-yellow-200 text-yellow-600 bg-yellow-50' :
                                        viewingEvent?.type === 'DEADLINE' ? 'border-orange-200 text-orange-600 bg-orange-50' :
                                            'border-blue-200 text-blue-600 bg-blue-50'}
                            `}
                        >
                            {viewingEvent?.type}
                        </Badge>
                        <div className="text-sm border-l-2 pl-3 border-muted">
                            <span className="font-semibold text-muted-foreground block mb-1">Date Range</span>
                            <div className="font-mono text-foreground font-bold">
                                {viewingEvent && new Date(viewingEvent.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                {viewingEvent?.endDate && viewingEvent.endDate !== viewingEvent.date && (
                                    <> <br /><span className="text-muted-foreground font-normal">to</span> <br />{new Date(viewingEvent.endDate).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</>
                                )}
                            </div>
                        </div>
                        {viewingEvent?.description && (
                            <div className="text-sm bg-muted/30 p-4 rounded-md">
                                {viewingEvent.description}
                            </div>
                        )}
                    </div>
                    {!readOnly && (
                        <div className="flex justify-end gap-2 border-t pt-4">
                            <Button variant="outline" onClick={() => {
                                handleEditClick(viewingEvent);
                                setViewingEvent(null);
                            }}>
                                <Edit className="w-4 h-4 mr-2" /> Edit
                            </Button>
                            <Button variant="destructive" onClick={() => handleDeleteEvent(viewingEvent._id)}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete
                            </Button>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    );
}
