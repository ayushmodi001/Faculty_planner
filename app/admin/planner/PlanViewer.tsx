'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, Badge, SwissSubHeading } from '@/components/ui/SwissUI';
import { Calendar, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';

interface PlanViewerProps {
    plan: any; // Using explicit type locally defined in parent for now, can be shared later
}

export default function PlanViewer({ plan }: PlanViewerProps) {
    const { metrics, plan: schedule } = plan;

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

            {/* Metrics Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-primary text-primary-foreground border-none">
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-primary-foreground/80 text-sm font-medium">Est. Completion</span>
                            <Calendar className="w-4 h-4 opacity-80" />
                        </div>
                        <div className="text-2xl font-bold">
                            {format(new Date(metrics.completion_date), 'MMM d, yyyy')}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground text-sm font-medium">Total Duration</span>
                            <Clock className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">
                            {metrics.total_weeks} <span className="text-sm font-normal text-muted-foreground">Weeks</span>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="pt-6">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-muted-foreground text-sm font-medium">Contact Hours</span>
                            <CheckCircle className="w-4 h-4 text-muted-foreground" />
                        </div>
                        <div className="text-2xl font-bold">
                            {metrics.total_lectures} <span className="text-sm font-normal text-muted-foreground">Lectures</span>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold">Proposed Schedule</h3>
                </div>

                {schedule.map((week: any, idx: number) => (
                    <div key={idx} className="relative pl-8 border-l-2 border-border pb-8 last:pb-0 last:border-none">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-background border-2 border-primary"></div>

                        <div className="mb-4">
                            <span className="text-xs font-bold uppercase tracking-wider text-primary mb-1 block">Week {week.week}</span>
                            <h4 className="text-lg font-bold">
                                {format(new Date(week.startDate), 'MMM d')} - {format(new Date(week.endDate), 'MMM d')}
                            </h4>
                        </div>

                        <div className="grid gap-3">
                            {week.topics.map((topic: any, tIdx: number) => (
                                <div key={tIdx} className="bg-card border rounded-md p-4 flex items-start justify-between group hover:border-primary/50 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-sm text-foreground">{topic.title}</p>
                                        <div className="flex items-center gap-2 mt-2">
                                            {topic.is_self_study ? (
                                                <Badge variant="warning" className="text-[10px] px-1 py-0 h-5">Self Study</Badge>
                                            ) : (
                                                <Badge className="text-[10px] px-1 py-0 h-5 bg-slate-100 text-slate-700 hover:bg-slate-200 border-none">Lecture</Badge>
                                            )}
                                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {topic.duration_mins} mins
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {week.topics.length === 0 && (
                                <div className="text-sm text-muted-foreground italic bg-muted/30 p-3 rounded">
                                    No regular lectures scheduled (Holiday or Recess).
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
