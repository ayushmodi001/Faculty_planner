'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui/SwissUI';
import { Clock, Plus, Trash2, Save, Loader2, Calendar } from 'lucide-react';
import { SearchableSelect } from "@/components/ui/searchable-select";
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
    const [collegeSettings, setCollegeSettings] = useState({ collegeStartTime: "09:00", collegeEndTime: "16:00", slotDurationHours: 1 });
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    // Fetch College Settings
    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const res = await fetch('/api/admin/settings');
                const data = await res.json();
                if (data.success && data.settings) {
                    setCollegeSettings({
                        collegeStartTime: data.settings.collegeStartTime || "09:00",
                        collegeEndTime: data.settings.collegeEndTime || "16:00",
                        slotDurationHours: data.settings.slotDurationHours || 1
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
            }
        };
        fetchSettings();
    }, []);

    // Load Timetable when Group is selected
    useEffect(() => {
        if (!selectedGroupId) return;

        const fetchTimetable = async () => {
            setIsLoading(true);
            try {
                const res = await fetch(`/api/admin/timetable?id=${selectedGroupId}`);
                const data = await res.json();
                if (data.timetable && Object.keys(data.timetable).length > 0) {
                    setTimetable(data.timetable);
                } else {
                    // Default empty structure with pre-filled times based on college settings
                    const defaults: any = {};

                    const startHour = parseInt(collegeSettings.collegeStartTime.split(':')[0]);
                    const endHour = parseInt(collegeSettings.collegeEndTime.split(':')[0]);
                    const slotDuration = collegeSettings.slotDurationHours;

                    const defaultSlots: ISlot[] = [];
                    for (let h = startHour; h < endHour; h += slotDuration) {
                        const start = `${h.toString().padStart(2, '0')}:00`;
                        const end = `${(h + slotDuration).toString().padStart(2, '0')}:00`;
                        defaultSlots.push({
                            startTime: start,
                            endTime: end,
                            room: "",
                            type: 'Lecture'
                        });
                    }

                    DAYS.forEach(d => defaults[d] = JSON.parse(JSON.stringify(defaultSlots)));
                    setTimetable(defaults);
                }
            } catch (err) {
                toast.error("Failed to load timetable");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [selectedGroupId, collegeSettings]);

    const [facultyList, setFacultyList] = useState<{ name: string, email: string }[]>([]);
    const [subjectList, setSubjectList] = useState<{ _id: string, name: string, code: string }[]>([]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // Fetch Faculty
                const resFac = await fetch('/api/admin/users/list?role=FACULTY');
                const dataFac = await resFac.json();
                if (dataFac.success) setFacultyList(dataFac.users);

                // Fetch Subjects
                const resSub = await fetch('/api/admin/subjects');
                const dataSub = await resSub.json();
                if (dataSub.success) setSubjectList(dataSub.subjects);

            } catch (error) {
                console.error("Failed to fetch resources", error);
            }
        };
        fetchResources();
    }, []);

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

            const data = await res.json();
            if (!res.ok) {
                if (res.status === 409) {
                    throw new Error(data.details || data.error);
                }
                throw new Error(data.error || "Save failed");
            }
            toast.success("Timetable Saved!");

        } catch (err: any) {
            toast.error(err.message || "Error saving timetable");
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

    const activeGroup = facultyGroups.find(g => (g._id as unknown as string) === selectedGroupId);

    // Improved Subject filtering: 
    // 1. Case-insensitive matching with assigned subjects
    // 2. Fallback to ALL subjects if no matches or none assigned
    const assignedNames = activeGroup?.subjects || [];
    const filteredSubjects = assignedNames.length > 0
        ? subjectList.filter(s =>
            assignedNames.some(name => name.trim().toLowerCase() === s.name.trim().toLowerCase())
        )
        : subjectList;

    const allowedSubjects = (filteredSubjects.length > 0 || assignedNames.length === 0)
        ? (filteredSubjects.length > 0 ? filteredSubjects : subjectList)
        : subjectList;

    const allowedFaculties = activeGroup?.members?.length
        ? facultyList.filter(f => activeGroup.members?.some(m => m.trim().toLowerCase() === f.name.trim().toLowerCase()))
        : facultyList;

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
                    <div className="w-full md:w-[300px]">
                        <SearchableSelect
                            options={facultyGroups.map(g => ({ value: g._id as unknown as string, label: g.name }))}
                            value={selectedGroupId}
                            onValueChange={setSelectedGroupId}
                            placeholder="Search and select a faculty group..."
                        />
                    </div>
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
                                            <SearchableSelect
                                                options={allowedSubjects.map(s => ({ value: s.name, label: `${s.name} (${s.code})` }))}
                                                value={slot.subject || ''}
                                                onValueChange={(val) => handleUpdateSlot(day, idx, 'subject', val)}
                                                placeholder="Select Subject"
                                                className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                                            />
                                        </div>

                                        <div className="flex gap-2 items-center">
                                            <div className="flex-1">
                                                <SearchableSelect
                                                    options={allowedFaculties.map(f => ({ value: f.name, label: f.name }))}
                                                    value={slot.faculty || ''}
                                                    onValueChange={(val) => handleUpdateSlot(day, idx, 'faculty', val)}
                                                    placeholder="Select Faculty"
                                                    className="w-full h-8 text-xs bg-background border border-input rounded-md px-2 focus:outline-none focus:ring-2 focus:ring-ring"
                                                />
                                            </div>
                                            <Input
                                                className="h-7 text-xs w-20"
                                                placeholder="Room"
                                                value={slot.room || ''}
                                                onChange={(e) => handleUpdateSlot(day, idx, 'room', e.target.value)}
                                            />
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity p-0"
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
