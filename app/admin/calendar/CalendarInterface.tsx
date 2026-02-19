'use client';

import React, { useState, useEffect } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge } from '@/components/ui/SwissUI';
import { createCalendarEvent, getCalendarEvents, deleteCalendarEvent } from '@/app/actions/calendar';
import { toast } from 'sonner';
import { Loader2, Plus, Trash2, CalendarRange } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface CalendarInterfaceProps {
    readOnly?: boolean;
}

export default function CalendarInterface({ readOnly = false }: CalendarInterfaceProps) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [events, setEvents] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    // New Event State
    const [newEvent, setNewEvent] = useState({
        title: '',
        type: 'EVENT',
        description: ''
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

    const handleCreateEvent = async () => {
        if (!date || !newEvent.title) return;

        try {
            await createCalendarEvent({
                ...newEvent,
                date: date,
                type: newEvent.type as any
            });
            toast.success('Event Added');
            setIsDialogOpen(false);
            setNewEvent({ title: '', type: 'EVENT', description: '' });
            loadEvents();
        } catch (error) {
            toast.error('Failed to add event');
        }
    };

    const handleDeleteEvent = async (id: string) => {
        if (confirm('Delete this event?')) {
            await deleteCalendarEvent(id);
            loadEvents();
            toast.success('Event Deleted');
        }
    };

    // Filter events for selected date
    const selectedDateEvents = events.filter(e =>
        date && new Date(e.date).toDateString() === date.toDateString()
    );

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
                            className="rounded-md border mx-auto"
                            modifiers={{
                                event: (d) => events.some(e => new Date(e.date).toDateString() === d.toDateString())
                            }}
                            modifiersStyles={{
                                event: { fontWeight: 'bold', textDecoration: 'underline', color: 'var(--primary)' }
                            }}
                        />
                    </CardContent>
                </Card>
            </div>

            <div className="md:col-span-4 space-y-4">
                <Card className="h-full border-none shadow-sm bg-muted/20">
                    <CardHeader>
                        <CardTitle className="text-lg">
                            {date ? date.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }) : 'Select a date'}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {isLoading ? (
                            <Loader2 className="animate-spin w-8 h-8 mx-auto opacity-50" />
                        ) : selectedDateEvents.length > 0 ? (
                            selectedDateEvents.map(event => (
                                <div key={event._id} className="p-3 bg-background rounded-lg border shadow-sm flex justify-between items-start group">
                                    <div>
                                        <div className="font-bold text-sm">{event.title}</div>
                                        <Badge variant={event.type === 'HOLIDAY' ? 'destructive' : 'secondary'} className="mt-1 text-[10px]">
                                            {event.type}
                                        </Badge>
                                    </div>
                                    {!readOnly && (
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => handleDeleteEvent(event._id)}
                                        >
                                            <Trash2 className="w-3 h-3" />
                                        </Button>
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-8 text-muted-foreground text-sm">
                                No events scheduled.
                            </div>
                        )}

                        {!readOnly && date && (
                            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button className="w-full mt-4" variant="outline">
                                        <Plus className="w-4 h-4 mr-2" /> Add Event
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Add Event for {date.toLocaleDateString()}</DialogTitle>
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
                                        <Button onClick={handleCreateEvent} className="w-full">Save Event</Button>
                                    </div>
                                </DialogContent>
                            </Dialog>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
