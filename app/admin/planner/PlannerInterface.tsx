'use client';

import React, { useState } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, Wand2, CalendarCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { AIPlanTopicSchema } from '@/models/AIOutputSchema';
import { z } from 'zod';
import PlanViewer from './PlanViewer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"

interface PlannerInterfaceProps {
    facultyGroups: IFacultyGroup[];
}

// Type for the AI response
type GeneratedPlan = {
    plan: {
        week: number;
        startDate: string;
        endDate: string;
        topics: z.infer<typeof AIPlanTopicSchema>[];
    }[];
    metrics: {
        total_weeks: number;
        total_lectures: number;
        completion_date: string;
    }
}

export default function PlannerInterface({ facultyGroups }: PlannerInterfaceProps) {
    const [selectedGroupId, setSelectedGroupId] = useState<string>("");
    const [syllabusText, setSyllabusText] = useState<string>("");
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedPlan, setGeneratedPlan] = useState<GeneratedPlan | null>(null);

    const handleGenerate = async () => {
        if (!selectedGroupId || !syllabusText.trim()) {
            toast.error("Input missing", { description: "Please select a group and paste the syllabus." });
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
                    startDate: new Date().toISOString() // Start from today/next working day
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
                <Card className="h-fit sticky top-24">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Wand2 className="w-5 h-5 text-primary" />
                            Configuration
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Faculty Group
                            </label>
                            <Select onValueChange={setSelectedGroupId} value={selectedGroupId}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a group..." />
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
                            <p className="text-[0.8rem] text-muted-foreground">
                                This determines availability and holidays.
                            </p>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                                Syllabus Content
                            </label>
                            <Textarea
                                placeholder="Paste the full syllabus text here... (Units, Modules, Topics)"
                                className="min-h-[300px] font-mono text-sm resize-none"
                                value={syllabusText}
                                onChange={(e) => setSyllabusText(e.target.value)}
                            />
                        </div>

                        <Button
                            className="w-full"
                            size="lg"
                            onClick={handleGenerate}
                            disabled={isGenerating || !selectedGroupId || !syllabusText}
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

                    </CardContent>
                </Card>
            </div>

            {/* Output Section */}
            <div className="lg:col-span-2">
                {generatedPlan ? (
                    <PlanViewer plan={generatedPlan} />
                ) : (
                    <Card className="h-[500px] flex flex-col items-center justify-center text-center border-dashed border-2 bg-muted/20">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4 animate-pulse">
                            <CalendarCheck className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">Ready to Plan</h3>
                        <p className="text-muted-foreground max-w-sm mt-2">
                            Select a group and paste content to generate a deterministic, AI-optimized academic calendar.
                        </p>
                    </Card>
                )}
            </div>

        </div>
    );
}
