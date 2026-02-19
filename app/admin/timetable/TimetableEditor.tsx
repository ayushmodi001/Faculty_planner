'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button, Alert } from '@/components/ui/SwissUI';
import { Clock, Plus, Trash2, Save, Loader2, Calendar } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { IFacultyGroup } from '@/models/FacultyGroup';

interface ISlot {
    startTime: string;
    endTime: string;
    room?: string;
    subject?: string;
    faculty?: string;
    type: 'Lecture' | 'Lab' | 'Break';
}

interface TimetableEditorProps {
    facultyGroups: IFacultyGroup[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableEditor({ facultyGroups }: TimetableEditorProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [timetable, setTimetable] = useState<Record<string, ISlot[]>>({});
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Load Timetable when Group is selected
    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchTimetable = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/timetable?id=${selectedGroupId}`);
                const data = await res.json();
                if (data.timetable) {
                    setTimetable(data.timetable);
                } else {
                    // Default empty structure
                    const defaults: any = {};
                    DAYS.forEach(d => defaults[d] = []);
                    setTimetable(defaults);
                }
            } catch (err) {
                toast.error("Failed to load timetable");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [selectedGroupId]);

    const handleAddSlot = (day: string) => {
        const newSlot: ISlot = { startTime: "09:00", endTime: "10:00", room: "LT-1", type: "Lecture" };
        setTimetable(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), newSlot]
        }));
    };

    const handleUpdateSlot = (day: string, index: number, field: keyof ISlot, value: string) => {
        const updatedDay = [...(timetable[day] || [])];
        updatedDay[index] = { ...updatedDay[index], [field]: value };
        setTimetable(prev => ({ ...prev, [day]: updatedDay }));
    };

    const handleDeleteSlot = (day: string, index: number) => {
        const updatedDay = [...(timetable[day] || [])];
        updatedDay.splice(index, 1);
        setTimetable(prev => ({ ...prev, [day]: updatedDay }));
    };

    const handleSave = async () => {
        if (!selectedGroupId) return;
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/timetable', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyGroupId: selectedGroupId,
                    timetable: timetable
                })
            });

            if (!res.ok) throw new Error("Save failed");
            toast.success("Timetable Saved!");

        } catch (err) {
            toast.error("Error saving timetable");
        } finally {
            setIsSaving(false);
        }
    };

    const fileInputRef = React.useRef<HTMLInputElement>(null);

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        const toastId = toast.loading("Uploading timetable...");

        try {
            const res = await fetch('/api/admin/timetable/upload', {
                method: 'POST',
                body: formData
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Upload failed");

            toast.success(`Imported ${data.updated} groups successfully!`, { id: toastId });
            // Refresh if current group was updated? Ideally yes, but simpler to just notify.

        } catch (error: any) {
            toast.error(error.message, { id: toastId });
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = ''; // Reset input
        }
    };

    const handleExport = () => {
        window.open('/api/admin/timetable/download', '_blank');
    };

    const handleClear = async () => {
        if (!selectedGroupId) return;
        if (!confirm("Are you sure you want to clear the ENTIRE timetable for this class? This cannot be undone.")) return;

        setIsSaving(true);
        try {
            const res = await fetch(`/api/admin/timetable?id=${selectedGroupId}`, {
                method: 'DELETE'
            });

            if (!res.ok) throw new Error("Clear failed");

            // Allow state to clear
            const defaults: any = {};
            DAYS.forEach(d => defaults[d] = []);
            setTimetable(defaults);

            toast.success("Timetable Cleared!");
        } catch (err) {
            toast.error("Error clearing timetable");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex justify-between items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Select Class / Faculty Group
                        </CardTitle>
                        <div className="flex gap-2">
                            <input
                                type="file"
                                ref={fileInputRef}
                                className="hidden"
                                accept=".xlsx,.xls"
                                onChange={handleFileChange}
                            />
                            <Button variant="outline" size="sm" onClick={handleImportClick}>
                                <Plus className="w-4 h-4 mr-2" /> Import Excel
                            </Button>
                            <Button variant="outline" size="sm" onClick={handleExport}>
                                <Save className="w-4 h-4 mr-2" /> Export Excel
                            </Button>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                        <SelectTrigger className="w-full md:w-[300px]">
                            <SelectValue placeholder="Select a group..." />
                        </SelectTrigger>
                        <SelectContent>
                            {facultyGroups.map(g => (
                                <SelectItem key={g._id as string} value={g._id as string}>{g.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </CardContent>
            </Card>

            {selectedGroupId && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-bottom-2">
                    {DAYS.map(day => (
                        <Card key={day} className="h-fit">
                            <CardHeader className="pb-3 bg-muted/20 border-b">
                                <CardTitle className="text-base font-medium flex justify-between items-center">
                                    {day}
                                    <Button size="sm" variant="ghost" onClick={() => handleAddSlot(day)}>
                                        <Plus className="w-4 h-4" />
                                    </Button>
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3 pt-4">
                                {(timetable[day] || []).length === 0 && (
                                    <p className="text-xs text-muted-foreground text-center py-4">No slots scheduled</p>
                                )}
                                {(timetable[day] || []).map((slot, idx) => (
                                    <div key={idx} className="group flex flex-col gap-2 p-3 bg-card border rounded-md shadow-sm hover:border-primary/50 transition-colors">
                                        <div className="flex gap-2">
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">Start Time</Label>
                                                <Input
                                                    type="time"
                                                    className="h-7 text-xs"
                                                    value={slot.startTime}
                                                    onChange={(e) => handleUpdateSlot(day, idx, 'startTime', e.target.value)}
                                                />
                                            </div>
                                            <div className="flex-1 space-y-1">
                                                <Label className="text-[10px] text-muted-foreground">End Time</Label>
                                                <Input
                                                    type="time"
                                                    className="h-7 text-xs"
                                                    value={slot.endTime}
                                                    onChange={(e) => handleUpdateSlot(day, idx, 'endTime', e.target.value)}
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <Input
                                                className="h-7 text-xs"
                                                placeholder="Subject (e.g. Mathematics)"
                                                value={slot.subject || ''}
                                                onChange={(e) => handleUpdateSlot(day, idx, 'subject', e.target.value)}
                                            />
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <Input
                                                className="h-7 text-xs flex-1"
                                                placeholder="Faculty (e.g. Dr. Smith)"
                                                value={slot.faculty || ''}
                                                onChange={(e) => handleUpdateSlot(day, idx, 'faculty', e.target.value)}
                                            />
                                            <Input
                                                className="h-7 text-xs w-20"
                                                placeholder="Room"
                                                value={slot.room || ''}
                                                onChange={(e) => handleUpdateSlot(day, idx, 'room', e.target.value)}
                                            />
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                                                onClick={() => handleDeleteSlot(day, idx)}
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {selectedGroupId && (
                <div className="fixed bottom-6 right-6 z-50">
                    <div className="flex gap-2 shadow-xl">
                        <Button variant="destructive" size="lg" onClick={handleClear} disabled={isSaving}>
                            <Trash2 className="w-4 h-4 mr-2" />
                            Clear
                        </Button>
                        <Button size="lg" onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Save className="w-4 h-4 mr-2" />}
                            Save Timetable
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
