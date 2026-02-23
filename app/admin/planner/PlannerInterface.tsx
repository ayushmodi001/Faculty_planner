'use client';

import React, { useState, useEffect } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, Wand2, CalendarCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIPlanTopicSchema } from '@/models/AIOutputSchema';
import { z } from 'zod';
import PlanViewer from './PlanViewer';
import { SearchableSelect } from "@/components/ui/searchable-select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getPlanForGroup } from '@/app/actions/faculty';
import { IPlan } from '@/models/Plan';

interface PlannerInterfaceProps {
    facultyGroups: IFacultyGroup[];
    readOnly?: boolean;
    initialPlan?: any;
    defaultGroupId?: string;
}

// Type for the AI response
type GeneratedPlan = {
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

    // New State Fields
    const [subject, setSubject] = useState("");

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

    // New Fields State
    const [availableSubjects, setAvailableSubjects] = useState<string[]>([]);
    const [availableMembers, setAvailableMembers] = useState<string[]>([]);
    const [facultyName, setFacultyName] = useState("");
    const [isParsing, setIsParsing] = useState(false);

    const handleGroupChange = (value: string) => {
        setSelectedGroupId(value);
        const group = facultyGroups.find(g => (g._id as unknown as string) === value);
        if (group) {
            setAvailableSubjects(group.subjects || []);
            setAvailableMembers(group.members || []);
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
            toast.success("Syllabus Uploaded", { description: "Text extracted successfully." });
        } catch (err) {
            toast.error("Upload Failed", { description: "Could not extract text from file." });
        } finally {
            setIsParsing(false);
        }
    };

    const reconstructPlanData = (dbPlan: IPlan) => {
        const reconstructedPlan: GeneratedPlan = {
            metrics: {
                total_weeks: Math.ceil((dbPlan.syllabus_topics?.length || 0) / 3), // Approx 3 lectures per week
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
                startDate: weekStart, // Actual dates from topics
                endDate: weekEnd,
                topics: weekTopics
            });
            currentWeek++;
        }
        return reconstructedPlan;
    };

    useEffect(() => {
        if (defaultGroupId) {
            handleGroupChange(defaultGroupId);
        }
    }, [defaultGroupId]);

    // Fetch plan when group changes in read-only mode
    useEffect(() => {
        if (readOnly && selectedGroupId) {
            const fetchPlan = async () => {
                setIsGenerating(true);
                const result = await getPlanForGroup(selectedGroupId);
                if (result.success && result.data) {
                    const dbPlan = result.data as IPlan;
                    setSubject(dbPlan.subject);
                    setGeneratedPlan(reconstructPlanData(dbPlan));
                    toast.success("Plan Loaded", { description: `Viewing approved plan for ${dbPlan.subject}` });
                } else {
                    setGeneratedPlan(null);
                    if (!result.success && result.error !== "No plan found") {
                        toast.error("Could not load plan");
                    }
                }
                setIsGenerating(false);
            };
            fetchPlan();
        }
    }, [selectedGroupId, readOnly]);

    const handleGenerate = async () => {
        if (!selectedGroupId || !syllabusText.trim() || !subject) {
            toast.error("Input missing", { description: "Please fill all fields." });
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
                    facultyName: facultyName
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Planning failed");
            }

            // fetch the saved plan from DB to display it properly
            const result = await getPlanForGroup(selectedGroupId);
            if (result.success && result.data) {
                const dbPlan = result.data as IPlan;
                const finalGenerated = reconstructPlanData(dbPlan);
                setGeneratedPlan(finalGenerated);
                toast.success("Plan Generated", { description: `Created a ${finalGenerated.metrics.total_weeks}-week schedule.` });
            } else {
                throw new Error("Plan was generated but could not be retrieved from database for viewing.");
            }

        } catch (error: any) {
            toast.error("Generation Failed", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className={`grid ${readOnly && defaultGroupId ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'} gap-8`}>

            {/* Input Section */}
            {!(readOnly && defaultGroupId) && (
                <div className="lg:col-span-1 space-y-6">
                    <Card className={`h-fit sticky top-24 ${readOnly ? 'opacity-90' : ''}`}>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Wand2 className="w-5 h-5 text-primary" />
                                Configuration
                                {readOnly && <span className="ml-auto text-xs bg-red-100 text-red-800 px-2 py-0.5 rounded-full">Read Only</span>}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-6">

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Faculty Group</label>
                                    <SearchableSelect
                                        options={facultyGroups.map(group => ({ value: group._id as unknown as string, label: group.name }))}
                                        value={selectedGroupId}
                                        onValueChange={handleGroupChange}
                                        placeholder="Select Faculty Group..."
                                    />
                                </div>

                                {!readOnly && (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Faculty Name</label>
                                            <SearchableSelect
                                                disabled={!selectedGroupId}
                                                options={availableMembers.map(member => ({ value: member, label: member }))}
                                                value={facultyName}
                                                onValueChange={setFacultyName}
                                                placeholder="Select Faculty Member..."
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Subject</label>
                                            <SearchableSelect
                                                disabled={!selectedGroupId}
                                                options={availableSubjects.map(subj => ({ value: subj, label: subj }))}
                                                value={subject}
                                                onValueChange={setSubject}
                                                placeholder="Select Subject..."
                                            />
                                        </div>



                                        <div className="space-y-2">
                                            <label className="text-sm font-medium">Syllabus Content (Upload PDF to auto-fill or paste manually)</label>
                                            <div className="flex flex-col gap-2">
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.txt"
                                                    onChange={handleFileUpload}
                                                    className="cursor-pointer bg-muted/20"
                                                />
                                                {isParsing && <p className="text-xs text-muted-foreground animate-pulse">Parsing file...</p>}
                                                <Textarea
                                                    placeholder="Syllabus text will appear here after upload..."
                                                    className="min-h-[150px] font-mono text-sm resize-none"
                                                    value={syllabusText}
                                                    onChange={(e) => setSyllabusText(e.target.value)}
                                                />
                                                {syllabusText.length > 0 && syllabusText.length < 50 && (
                                                    <p className="text-xs text-red-500">
                                                        Text is too short ({syllabusText.length} chars). Minimum 50 required for AI generation.
                                                    </p>
                                                )}
                                            </div>
                                        </div>

                                        <Button
                                            className="w-full"
                                            size="lg"
                                            onClick={handleGenerate}
                                            disabled={isGenerating || isParsing || !selectedGroupId || !syllabusText || !subject}
                                        >
                                            {isGenerating ? (
                                                <>
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Generating Plan...
                                                </>
                                            ) : (
                                                <>
                                                    <Wand2 className="mr-2 h-4 w-4" /> Generate Schedule
                                                </>
                                            )}
                                        </Button>
                                    </>
                                )}
                            </div>

                            {readOnly && selectedGroupId && (
                                <div className="bg-muted/30 p-4 rounded-lg text-sm text-center text-muted-foreground">
                                    Viewing plan for <span className="font-bold text-foreground">{subject || "Selected Group"}</span>.
                                    Editing is disabled.
                                </div>
                            )}

                        </CardContent>
                    </Card>
                </div>
            )}

            {/* Output Section */}
            <div className={readOnly && defaultGroupId ? 'lg:col-span-1' : 'lg:col-span-2'}>
                {generatedPlan ? (
                    <PlanViewer plan={generatedPlan} />
                ) : (
                    <Card className="h-[500px] flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/20">
                        {isGenerating ? (
                            <>
                                <Loader2 className="w-10 h-10 animate-spin text-primary mb-4" />
                                <h3 className="text-lg font-bold text-foreground">Loading Plan...</h3>
                            </>
                        ) : (
                            <>
                                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 animate-pulse">
                                    <CalendarCheck className="w-8 h-8 text-muted-foreground" />
                                </div>
                                <h3 className="text-lg font-bold text-foreground">
                                    {readOnly ? "Select a Group" : "Ready to Plan"}
                                </h3>
                                <p className="text-muted-foreground max-w-sm mt-2">
                                    {readOnly
                                        ? "Choose a faculty group to view the active academic calendar."
                                        : "Select a group and paste content to generate a deterministic, AI-optimized academic calendar."}
                                </p>
                            </>
                        )}
                    </Card>
                )}
            </div>

        </div>
    );
}
