'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui/SwissUI';
import { Clock, Plus, Trash2, Save, Loader2, Calendar } from 'lucide-react';
import { SearchableSelect } from "@/components/ui/searchable-select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from 'sonner';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { cn } from '@/lib/utils';

interface ISlot {
    startTime: string;
    endTime: string;
    room?: string;
    subject?: string;
    faculty?: string;
    type: 'Lecture' | 'Lab' | 'Break' | 'Seminar' | 'Tutorial' | 'Workshop';
}

interface TimetableEditorProps {
    facultyGroups: IFacultyGroup[];
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function TimetableEditor({ facultyGroups }: TimetableEditorProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [timetable, setTimetable] = useState<Record<string, ISlot[]>>({});
    const [collegeSettings, setCollegeSettings] = useState({
        collegeStartTime: "09:00",
        collegeEndTime: "16:00",
        slotDurationHours: 1,
        labDurationHours: 2,
        breakStartTime: "13:00",
        breakDurationHours: 1
    });
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
                        slotDurationHours: data.settings.slotDurationHours || 1,
                        labDurationHours: data.settings.labDurationHours || 2,
                        breakStartTime: data.settings.breakStartTime || "13:00",
                        breakDurationHours: data.settings.breakDurationHours || 1
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
                    handleGenerateSkeleton();
                }
            } catch (err) {
                toast.error("Failed to load timetable");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTimetable();
    }, [selectedGroupId, collegeSettings]);

    const handleGenerateSkeleton = () => {
        const defaults: any = {};
        const startTimeStr = collegeSettings.collegeStartTime;
        const endTimeStr = collegeSettings.collegeEndTime;
        const lectureDuration = collegeSettings.slotDurationHours;
        const breakStartTime = collegeSettings.breakStartTime;
        const breakDuration = collegeSettings.breakDurationHours;

        const defaultSlots: ISlot[] = [];
        const [startH, startM] = startTimeStr.split(':').map(Number);
        const [endH, endM] = endTimeStr.split(':').map(Number);

        let current = new Date();
        current.setHours(startH, startM, 0, 0);
        const endLimit = new Date();
        endLimit.setHours(endH, endM, 0, 0);

        while (current < endLimit) {
            const timeStr = `${current.getHours().toString().padStart(2, '0')}:${current.getMinutes().toString().padStart(2, '0')}`;
            if (timeStr === breakStartTime) {
                const next = new Date(current.getTime() + (breakDuration * 60 * 60 * 1000));
                defaultSlots.push({
                    startTime: timeStr,
                    endTime: `${next.getHours().toString().padStart(2, '0')}:${next.getMinutes().toString().padStart(2, '0')}`,
                    type: 'Break',
                    room: "Cafeteria"
                });
                current = next;
            } else {
                const next = new Date(current.getTime() + (lectureDuration * 60 * 60 * 1000));
                if (next > endLimit) break;
                defaultSlots.push({
                    startTime: timeStr,
                    endTime: `${next.getHours().toString().padStart(2, '0')}:${next.getMinutes().toString().padStart(2, '0')}`,
                    type: 'Lecture',
                    room: ""
                });
                current = next;
            }
        }

        DAYS.forEach(d => defaults[d] = JSON.parse(JSON.stringify(defaultSlots)));
        setTimetable(defaults);
        toast.success("Default skeleton generated based on settings");
    };

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
        const lastSlot = timetable[day]?.[timetable[day].length - 1];
        const start = lastSlot ? lastSlot.endTime : collegeSettings.collegeStartTime;
        const [h, m] = start.split(':').map(Number);
        const end = new Date();
        end.setHours(h, m + (collegeSettings.slotDurationHours * 60), 0, 0);

        const newSlot: ISlot = {
            startTime: start,
            endTime: `${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}`,
            room: "",
            type: "Lecture"
        };

        setTimetable(prev => ({
            ...prev,
            [day]: [...(prev[day] || []), newSlot]
        }));
    };

    const handleUpdateSlot = (day: string, index: number, field: keyof ISlot, value: string) => {
        const updatedDay = [...(timetable[day] || [])];
        const slot = { ...updatedDay[index], [field]: value };

        // Auto-recalculate end time if type changes
        if (field === 'type') {
            const duration = value === 'Lab' ? collegeSettings.labDurationHours :
                value === 'Break' ? collegeSettings.breakDurationHours :
                    collegeSettings.slotDurationHours;

            const [h, m] = slot.startTime.split(':').map(Number);
            const date = new Date();
            date.setHours(h, m + (duration * 60), 0, 0);
            slot.endTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;

            if (value === 'Break') {
                slot.subject = "";
                slot.faculty = "";
                slot.room = "Common";
            }
        }

        updatedDay[index] = slot;
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

    const handleSaveSettings = async () => {
        setIsSaving(true);
        try {
            const res = await fetch('/api/admin/settings', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(collegeSettings)
            });
            const data = await res.json();
            if (data.success) {
                toast.success('College timings updated');
            } else {
                toast.error(data.error || 'Failed to update settings');
            }
        } catch (err) {
            toast.error('Failed to update settings');
        } finally {
            setIsSaving(false);
        }
    };

    const activeGroup = facultyGroups.find(g => (g._id as unknown as string) === selectedGroupId);

    // Improved Subject filtering: 
    // 1. Case-insensitive matching with assigned subjects
    // 2. Fallback to ALL subjects if no matches or none assigned
    const assignedNames = (activeGroup as any)?.subjects || [];
    const filteredSubjects = assignedNames.length > 0
        ? subjectList.filter((s: { _id: string; name: string; code: string }) =>
            assignedNames.some((n: any) => {
                const subjectName = typeof n === 'string' ? n : n.name;
                return (subjectName || '').trim().toLowerCase() === s.name.trim().toLowerCase();
            })
        )
        : subjectList;

    const allowedSubjects = filteredSubjects.length > 0 ? filteredSubjects : subjectList;

    const allowedFaculties = (activeGroup as any)?.members?.length
        ? facultyList.filter(f => (activeGroup as any).members?.some((m: any) => {
            const facultyName = typeof m === 'string' ? m : m.name;
            return (facultyName || '').trim().toLowerCase() === f.name.trim().toLowerCase();
        }))
        : facultyList;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Card className="lg:col-span-1 shadow-md border-border">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                            <Clock className="w-4 h-4 text-primary" />
                            Session Controls
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="pt-6 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">College Start</Label>
                                <Input
                                    type="time"
                                    value={collegeSettings.collegeStartTime}
                                    onChange={(e) => setCollegeSettings({ ...collegeSettings, collegeStartTime: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">College End</Label>
                                <Input
                                    type="time"
                                    value={collegeSettings.collegeEndTime}
                                    onChange={(e) => setCollegeSettings({ ...collegeSettings, collegeEndTime: e.target.value })}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lecture (Hrs)</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={collegeSettings.slotDurationHours}
                                    onChange={(e) => setCollegeSettings({ ...collegeSettings, slotDurationHours: Number(e.target.value) })}
                                    className="h-9 text-xs"
                                />
                            </div>
                            <div className="space-y-1.5">
                                <Label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Lab (Hrs)</Label>
                                <Input
                                    type="number"
                                    step="0.5"
                                    value={collegeSettings.labDurationHours}
                                    onChange={(e) => setCollegeSettings({ ...collegeSettings, labDurationHours: Number(e.target.value) })}
                                    className="h-9 text-xs"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5 pt-2">
                            <Button className="w-full h-9 text-[10px] font-black uppercase tracking-widest" onClick={handleSaveSettings}>
                                Update Global Timings
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <Card className="lg:col-span-2 shadow-md border-border">
                    <CardHeader className="bg-muted/30 border-b pb-4">
                        <div className="flex justify-between items-center">
                            <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                <Plus className="w-4 h-4 text-primary" />
                                Selection & Deployment
                            </CardTitle>
                            <div className="flex gap-2">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                />
                                <Button variant="outline" size="sm" onClick={handleImportClick} className="h-8 text-[9px] font-black uppercase tracking-widest border-slate-200">
                                    Import
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleExport} className="h-8 text-[9px] font-black uppercase tracking-widest border-slate-200">
                                    Export
                                </Button>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <div className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Target Faculty Group / Class</Label>
                                <SearchableSelect
                                    options={facultyGroups.map(g => ({ value: g._id as unknown as string, label: g.name }))}
                                    value={selectedGroupId}
                                    onValueChange={setSelectedGroupId}
                                    placeholder="Select a class to manage its weekly schedule..."
                                />
                            </div>
                            {selectedGroupId && (
                                <Button
                                    variant="outline"
                                    className="w-full border-blue-200 text-blue-600 bg-blue-50/50 hover:bg-blue-50 h-10 font-black text-[10px] uppercase tracking-widest"
                                    onClick={handleGenerateSkeleton}
                                >
                                    <Clock className="w-4 h-4 mr-2" />
                                    Generate Daily Skeleton from Controls
                                </Button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>

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
                                    <div key={idx} className={cn(
                                        "group flex flex-col gap-3 p-5 border-2 rounded-3xl shadow-sm transition-all hover:ring-4 hover:ring-primary/5",
                                        slot.type === 'Break' ? "bg-muted/10 border-border/60" : "bg-card border-slate-100"
                                    )}>
                                        <div className="flex gap-4">
                                            <div className="flex-[0.8] space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Type</Label>
                                                <select
                                                    className="w-full h-10 text-[10px] font-black uppercase tracking-widest bg-white border border-slate-200 rounded-xl px-3 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none cursor-pointer"
                                                    value={slot.type}
                                                    onChange={(e) => handleUpdateSlot(day, idx, 'type', e.target.value as any)}
                                                >
                                                    <option value="Lecture">Lecture</option>
                                                    <option value="Lab">Lab</option>
                                                    <option value="Seminar">Seminar</option>
                                                    <option value="Tutorial">Tutorial</option>
                                                    <option value="Workshop">Workshop</option>
                                                    <option value="Break">Break</option>
                                                </select>
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Start</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="time"
                                                        className="h-10 text-xs bg-white border-slate-200 rounded-xl px-3 pr-8 font-bold"
                                                        value={slot.startTime}
                                                        onChange={(e) => handleUpdateSlot(day, idx, 'startTime', e.target.value)}
                                                    />
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                            <div className="flex-1 space-y-1.5">
                                                <Label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">End</Label>
                                                <div className="relative">
                                                    <Input
                                                        type="time"
                                                        className="h-10 text-xs bg-white border-slate-200 rounded-xl px-3 pr-8 font-bold"
                                                        value={slot.endTime}
                                                        onChange={(e) => handleUpdateSlot(day, idx, 'endTime', e.target.value)}
                                                    />
                                                    <Clock className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                                                </div>
                                            </div>
                                        </div>

                                        {slot.type !== 'Break' ? (
                                            <>
                                                <div className="space-y-1.5">
                                                    <SearchableSelect
                                                        options={allowedSubjects.map(s => ({ value: s.name, label: `${s.name} (${s.code})` }))}
                                                        value={slot.subject || ''}
                                                        onValueChange={(val) => handleUpdateSlot(day, idx, 'subject', val)}
                                                        placeholder="Select Subject / Curricula"
                                                        className="w-full h-10 text-xs bg-white border-slate-200 rounded-xl"
                                                    />
                                                </div>

                                                <div className="flex gap-3 items-center">
                                                    <div className="flex-1">
                                                        <SearchableSelect
                                                            options={allowedFaculties.map(f => ({ value: f.name, label: f.name }))}
                                                            value={slot.faculty || ''}
                                                            onValueChange={(val) => handleUpdateSlot(day, idx, 'faculty', val)}
                                                            placeholder="Select Faculty"
                                                            className="w-full h-10 text-xs bg-white border-slate-200 rounded-xl"
                                                        />
                                                    </div>
                                                    <Input
                                                        className="h-10 text-xs w-24 bg-white border-slate-200 rounded-xl px-3 font-medium placeholder:text-slate-300"
                                                        placeholder="Room"
                                                        value={slot.room || ''}
                                                        onChange={(e) => handleUpdateSlot(day, idx, 'room', e.target.value)}
                                                    />
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        className="h-10 w-10 text-slate-300 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all"
                                                        onClick={() => handleDeleteSlot(day, idx)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-2xl border border-primary/10">
                                                <div className="flex items-center gap-3">
                                                    <Clock className="w-4 h-4 text-primary/60" />
                                                    <span className="text-[10px] font-black uppercase text-primary tracking-[0.15em]">Scheduled Break / Recess Period</span>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-9 w-9 text-primary/40 hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                                    onClick={() => handleDeleteSlot(day, idx)}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        )}
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
