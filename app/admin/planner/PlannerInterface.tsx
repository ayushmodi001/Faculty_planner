import React, { useState, useEffect } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, Wand2, CalendarCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIPlanTopicSchema } from '@/models/AIOutputSchema';
import { z } from 'zod';
import PlanViewer from './PlanViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { getPlanForGroup } from '@/app/actions/faculty';
import { IPlan } from '@/models/Plan';

interface PlannerInterfaceProps {
    facultyGroups: IFacultyGroup[];
    readOnly?: boolean;
    initialPlan?: any;
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

export default function PlannerInterface({ facultyGroups, readOnly = false, initialPlan }: PlannerInterfaceProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [syllabusText, setSyllabusText] = useState<string>("");

    // New State Fields
    const [subject, setSubject] = useState("");
    const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
    const [endDate, setEndDate] = useState(
        new Date(new Date().setMonth(new Date().getMonth() + 4)).toISOString().split('T')[0]
    );

    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

    // Fetch plan when group changes in read-only mode
    useEffect(() => {
        if (readOnly && selectedGroupId) {
            const fetchPlan = async () => {
                setIsGenerating(true);
                const result = await getPlanForGroup(selectedGroupId);
                if (result.success && result.data) {
                    const dbPlan = result.data as IPlan;
                    setSubject(dbPlan.subject);

                    // Reconstruct GeneratedPlan structure from DB Plan
                    // Group topics by week (assuming ~3 lectures/week for simple reconstruction if dates missing)
                    // Or ideally use scheduled dates.

                    const reconstructedPlan: GeneratedPlan = {
                        metrics: {
                            total_weeks: Math.ceil(dbPlan.syllabus_topics.length / 3), // Approx
                            total_lectures: dbPlan.syllabus_topics.length,
                            completion_date: dbPlan.syllabus_topics[dbPlan.syllabus_topics.length - 1]?.scheduled_date
                                ? new Date(dbPlan.syllabus_topics[dbPlan.syllabus_topics.length - 1].scheduled_date!).toISOString()
                                : new Date().toISOString()
                        },
                        plan: []
                    };

                    const topics = dbPlan.syllabus_topics;
                    let currentWeek = 1;

                    for (let i = 0; i < topics.length; i += 3) {
                        const weekTopics = topics.slice(i, i + 3).map(t => ({
                            title: t.name,
                            topic: t.name,
                            duration_mins: t.original_duration_mins,
                            is_self_study: t.priority === 'SELF_STUDY',
                            complexity: 'Moderate'
                        }));

                        reconstructedPlan.plan.push({
                            week: currentWeek,
                            startDate: new Date().toISOString(), // Mock dates for view
                            endDate: new Date().toISOString(),
                            topics: weekTopics
                        });
                        currentWeek++;
                    }

                    setGeneratedPlan(reconstructedPlan);
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
        if (!selectedGroupId || !syllabusText.trim() || !startDate || !endDate || !subject) {
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
                    startDate: startDate,
                    endDate: endDate
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || "Planning failed");
            }

            const data = await response.json();
            setGeneratedPlan(data);
            toast.success("Plan Generated", { description: `Created a ${data.metrics.total_weeks}-week schedule.` });

        } catch (error: any) {
            toast.error("Generation Failed", { description: error.message });
        } finally {
            setIsGenerating(false);
        }
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Input Section */}
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

                        <div className="space-y-2">
                            <label className="text-sm font-medium">Faculty Group</label>
                            <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group to view..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {facultyGroups.length === 0 ? (
                                        <div className="p-2 text-sm text-muted-foreground">No groups found</div>
                                    ) : (
                                        facultyGroups.map(group => (
                                            <SelectItem key={group._id as string} value={group._id as string}>
                                                {group.name}
                                            </SelectItem>
                                        ))
                                    )}
                                </SelectContent>
                            </Select>
                            {readOnly && !selectedGroupId && <p className="text-xs text-muted-foreground">Select a group to load its active plan.</p>}
                        </div>

                        {!readOnly && (
                            <>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Subject Name</label>
                                    <Input
                                        placeholder="e.g. Data Structures"
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        disabled={readOnly}
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Start Date</label>
                                        <Input
                                            type="date"
                                            value={startDate}
                                            onChange={(e) => setStartDate(e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">End Date</label>
                                        <Input
                                            type="date"
                                            value={endDate}
                                            onChange={(e) => setEndDate(e.target.value)}
                                            disabled={readOnly}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Syllabus Content</label>
                                    <Textarea
                                        placeholder="Paste the full syllabus text here..."
                                        className="min-h-[200px] font-mono text-sm resize-none"
                                        value={syllabusText}
                                        onChange={(e) => setSyllabusText(e.target.value)}
                                        disabled={readOnly}
                                    />
                                </div>

                                <Button
                                    className="w-full"
                                    size="lg"
                                    onClick={handleGenerate}
                                    disabled={isGenerating || !selectedGroupId || !syllabusText || !subject || !startDate || !endDate}
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

                        {readOnly && selectedGroupId && (
                            <div className="bg-muted/30 p-4 rounded-lg text-sm text-center text-muted-foreground">
                                Viewing plan for <span className="font-bold text-foreground">{subject || "Selected Group"}</span>.
                                Editing is disabled.
                            </div>
                        )}

                    </CardContent>
                </Card>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2">
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
