'use client';

import React, { useState, useEffect } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loader2, Wand2, CalendarCheck, AlertCircle, FileText, BrainCircuit, Sparkles, ChevronRight, UploadCloud, Users, LayoutGrid, UserCircle } from 'lucide-react';
import { toast } from 'sonner';
import PlanViewer from './PlanViewer';
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getPlanForGroup } from '@/app/actions/faculty';
import { IPlan } from '@/models/Plan';
import { cn } from '@/lib/utils';

interface PlannerInterfaceProps {
    facultyGroups: IFacultyGroup[];
    readOnly?: boolean;
    initialPlan?: any;
    defaultGroupId?: string;
}

type GeneratedPlan = {
    subjectName?: string;
    plan: {
        week: number;
        startDate: string;
        endDate: string;
        topics: any[];
    }[];
    metrics: {
        total_weeks: number;
        total_lectures: number;
        completion_date: string;
    }
}

export default function PlannerInterface({ facultyGroups, readOnly = false, initialPlan, defaultGroupId }: PlannerInterfaceProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>(defaultGroupId || "");
    const [syllabusText, setSyllabusText] = useState<string>("");
    const [subject, setSubject] = useState("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableMembers, setAvailableMembers] = useState<string[]>([]);
    const [facultyName, setFacultyName] = useState("");
    const [secondaryFacultyName, setSecondaryFacultyName] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleGroupChange = (value: string) => {
        setSelectedGroupId(value);
        const group = facultyGroups.find(g => (g._id as unknown as string) === value);
        if (group) {
            setAvailableSubjects((group as any).subjects || []);
            setAvailableMembers((group as any).members || []);
            setSubject("");
            setFacultyName("");
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsParsing(true);
        const formData = new FormData();
        formData.append('file', file);

        try {
            const res = await fetch('/api/parse-syllabus', { method: 'POST', body: formData });
            if (!res.ok) throw new Error("Failed to parse file");
            const data = await res.json();
            setSyllabusText(data.text);
            toast.success("Syllabus loaded", { description: "Text extracted from the document." });
        } catch (err) {
            toast.error("Upload failed", { description: "The file could not be read." });
        } finally {
            setIsParsing(false);
            e.target.value = '';
        }
    };

    const reconstructPlanData = (dbPlan: any) => {
        const reconstructedPlan: GeneratedPlan = {
            subjectName: dbPlan.subject || (dbPlan.subject_id as any)?.name,
            metrics: {
                total_weeks: Math.ceil((dbPlan.syllabus_topics?.length || 0) / 3),
                total_lectures: dbPlan.syllabus_topics?.length || 0,
                completion_date: dbPlan.syllabus_topics?.[dbPlan.syllabus_topics.length - 1]?.scheduled_date
                    ? new Date(dbPlan.syllabus_topics[dbPlan.syllabus_topics.length - 1].scheduled_date!).toISOString()
                    : new Date().toISOString()
            },
            plan: []
        };

        const topics = dbPlan.syllabus_topics || [];
        let currentWeek = 1;

        for (let i = 0; i < topics.length; i += 3) {
            const weekTopics = topics.slice(i, i + 3).map((t: any) => ({
                title: t.name,
                topic: t.name,
                duration_mins: t.original_duration_mins || 60,
                is_self_study: t.priority === 'SELF_STUDY',
                complexity: 'Moderate',
                scheduled_date: t.scheduled_date || null
            }));

            let weekStart = new Date().toISOString();
            let weekEnd = new Date().toISOString();

            const validDates = weekTopics.map((t: any) => t.scheduled_date).filter(Boolean).map((d: any) => new Date(d).getTime());
            if (validDates.length > 0) {
                weekStart = new Date(Math.min(...validDates)).toISOString();
                weekEnd = new Date(Math.max(...validDates)).toISOString();
            }

            reconstructedPlan.plan.push({
                week: currentWeek,
                startDate: weekStart,
                endDate: weekEnd,
                topics: weekTopics
            });
            currentWeek++;
        }
        return reconstructedPlan;
    };

    useEffect(() => {
        if (defaultGroupId && facultyGroups.length > 0) {
            handleGroupChange(defaultGroupId);
        }
    }, [defaultGroupId, facultyGroups]);

    useEffect(() => {
        if (selectedGroupId && subject) {
            const fetchPlan = async () => {
                setIsGenerating(true);
                const result = await getPlanForGroup(selectedGroupId, subject);
                if (result.success && result.data) {
                    const dbPlan = result.data as any;
                    if (!subject) setSubject(dbPlan.subject || dbPlan.subject_id?.name || '');
                    setGeneratedPlan(reconstructPlanData(dbPlan));
                } else {
                    setGeneratedPlan(null);
                }
                setIsGenerating(false);
            };
            fetchPlan();
        }
    }, [selectedGroupId, subject]);

    const handleGenerate = async () => {
        if (!selectedGroupId || !syllabusText.trim() || !subject) {
            toast.error("Required fields missing");
            return;
        }

        setIsGenerating(true);
        setGeneratedPlan(null);

        try {
            const response = await fetch('/api/generate-plan', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    facultyGroupId: selectedGroupId,
                    syllabusText: syllabusText,
                    subject: subject,
                    facultyName: facultyName,
                    facultyNames: [facultyName, secondaryFacultyName].filter(Boolean)
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Generation failed");
            }

            const result = await getPlanForGroup(selectedGroupId);
            if (result.success && result.data) {
                const dbPlan = result.data as IPlan;
                const finalGenerated = reconstructPlanData(dbPlan);
                setGeneratedPlan(finalGenerated);
                toast.success("Schedule created", { description: `Plan for ${finalGenerated.metrics.total_weeks} weeks generated successfully.` });
            } else {
                throw new Error("Plan was generated but could not be saved correctly.");
            }

        } catch (error: any) {
            toast.error("Creation failed", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    if (!mounted) {
        return (
            <div className={`grid ${readOnly && defaultGroupId ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'} gap-8`}>
                {!(readOnly && defaultGroupId) && (
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="shadow-lg border-border/60">
                            <CardHeader className="pb-4 border-b bg-muted/20">
                                <CardTitle className="text-xl font-black tracking-tight">Setup & Details</CardTitle>
                                <CardDescription className="text-xs font-medium">Select a class group and subject to begin</CardDescription>
                            </CardHeader>
                        </Card>
                    </div>
                )}
            </div>
        )
    }

    return (
        <div className={`grid ${readOnly && defaultGroupId ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-5'} gap-8`}>

            {/* Config Panel */}
            {!(readOnly && defaultGroupId) && (
                <div className="lg:col-span-2 space-y-6">
                    <Card className="shadow-lg border-border/60">
                        <CardHeader className="pb-4 border-b bg-muted/20">
                            <CardTitle className="text-xl font-black tracking-tight">Setup & Details</CardTitle>
                            <CardDescription className="text-xs font-medium">Select a class group and subject to begin</CardDescription>
                        </CardHeader>

                        <CardContent className="p-6 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <Users className="w-3.5 h-3.5" /> Class Group
                                    </label>
                                    <SearchableSelect
                                        options={facultyGroups.map(group => ({ value: group._id as unknown as string, label: group.name }))}
                                        value={selectedGroupId}
                                        onValueChange={handleGroupChange}
                                        placeholder="Choose Group..."
                                        disabled={!!defaultGroupId}
                                    />
                                </div>

                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                        <FileText className="w-3.5 h-3.5" /> Subject
                                    </label>
                                    <SearchableSelect
                                        disabled={!selectedGroupId}
                                        options={availableSubjects.map((subj: any) => ({ value: subj.name || subj, label: subj.name || subj }))}
                                        value={subject}
                                        onValueChange={setSubject}
                                        placeholder="Choose Subject..."
                                    />
                                </div>

                                {!readOnly && (
                                    <>
                                        <div className="space-y-4 pt-4 border-t border-border/40">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <UserCircle className="w-3.5 h-3.5" /> Primary Teacher
                                                </label>
                                                <SearchableSelect
                                                    disabled={!selectedGroupId}
                                                    options={availableMembers.map((member: any) => ({ value: member.name || member, label: member.name || member }))}
                                                    value={facultyName}
                                                    onValueChange={setFacultyName}
                                                    placeholder="Assign Main Teacher..."
                                                />
                                            </div>

                                            <div className="space-y-1.5 pb-4">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                    <Sparkles className="w-3.5 h-3.5" /> Second Teacher (Optional)
                                                </label>
                                                <SearchableSelect
                                                    disabled={!selectedGroupId}
                                                    options={availableMembers.map((member: any) => ({ value: member.name || member, label: member.name || member }))}
                                                    value={secondaryFacultyName}
                                                    onValueChange={setSecondaryFacultyName}
                                                    placeholder="For Split Syllabus..."
                                                />
                                                <p className="text-[9px] text-muted-foreground italic">Required if syllabus is shared between two faculties.</p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-2">
                                                <UploadCloud className="w-3.5 h-3.5" /> Syllabus
                                            </label>
                                            <div className="relative group border-2 border-dashed border-border/60 rounded-2xl p-8 bg-muted/10 hover:bg-muted/30 hover:border-primary/40 transition-all text-center">
                                                <UploadCloud className="h-8 w-8 text-muted-foreground/30 mx-auto mb-3" />
                                                <p className="text-[10px] font-black text-muted-foreground/60 uppercase tracking-widest">Import PDF or Text File</p>
                                                <input
                                                    type="file"
                                                    accept=".pdf,.txt"
                                                    onChange={handleFileUpload}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    title="Upload Syllabus"
                                                />
                                            </div>
                                            {isParsing && (
                                                <div className="flex items-center gap-2 justify-center py-2">
                                                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                                                    <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest">Reading Syllabus...</span>
                                                </div>
                                            )}
                                            <Textarea
                                                placeholder="Syllabus text will be extracted here..."
                                                className="min-h-[120px] text-xs font-medium"
                                                value={syllabusText}
                                                onChange={(e) => setSyllabusText(e.target.value)}
                                            />
                                        </div>

                                        <Button
                                            className="w-full h-12 font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || isParsing || !selectedGroupId || !syllabusText || !subject}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                                                </>
                                            ) : (
                                                <>Create Schedule</>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Viewer Panel */}
            <div className={readOnly && defaultGroupId ? 'lg:col-span-1' : 'lg:col-span-3'}>
                {generatedPlan ? (
                    <PlanViewer plan={generatedPlan} />
                ) : (
                    <Card className="h-[550px] flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/5 border-border shadow-sm rounded-3xl">
                        {isGenerating ? (
                            <div className="space-y-6">
                                <Loader2 className="w-10 h-10 animate-spin text-primary mx-auto" />
                                <h3 className="text-xl font-black text-foreground tracking-tight">Creating Plan</h3>
                                <p className="text-muted-foreground text-xs font-medium max-w-xs">Organizing syllabus into weekly sessions...</p>
                            </div>
                        ) : (
                            <div className="space-y-8 px-10">
                                <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto border border-primary/20">
                                    <CalendarCheck className="w-8 h-8 text-primary" />
                                </div>
                                <div className="space-y-2">
                                    <h3 className="text-2xl font-black text-foreground tracking-tight">
                                        {readOnly
                                            ? (selectedGroupId ? (subject ? "No Plan Found" : "Select Subject") : "Select Group and Subject")
                                            : "Ready to Generate"}
                                    </h3>
                                    <p className="text-muted-foreground text-sm max-w-xs mx-auto font-medium leading-relaxed">
                                        {readOnly
                                            ? "Complete the group and subject selection to view the schedule."
                                            : "Provide the syllabus and details to create a schedule."}
                                    </p>
                                </div>
                            </div>
                        )}
                    </Card>
                )}
            </div>
        </div>
    );
}
