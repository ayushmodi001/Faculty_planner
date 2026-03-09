'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, CheckCircle, Clock, Download, ChevronRight, Activity, Zap, Sparkles, LayoutGrid, CalendarRange, BookOpen } from 'lucide-react';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { cn } from '@/lib/utils';

interface PlanViewerProps {
    plan: any;
}

export default function PlanViewer({ plan }: PlanViewerProps) {
    const { metrics, plan: schedule } = plan;

    const handleDownloadPDF = () => {
        const doc = new jsPDF();
        doc.setFontSize(22);
        doc.setTextColor(30, 41, 59); // slate-800
        doc.text("Academic Schedule", 105, 20, { align: "center" });
        doc.setFontSize(10);
        doc.setTextColor(100, 116, 139); // slate-500
        doc.text("Generated via UAPS", 200, 20, { align: "right" });
        doc.line(14, 25, 196, 25);

        doc.setFontSize(11);
        doc.setTextColor(15, 23, 42); // slate-900
        doc.text(`Course: ${plan.subjectName || 'N/A'}`, 14, 35);
        doc.text(`Completion Date: ${format(new Date(metrics.completion_date), 'MMM dd, yyyy')}`, 14, 42);

        const rows: any[] = [];
        let srNo = 1;
        schedule.forEach((week: any) => {
            week.topics.forEach((topic: any) => {
                rows.push([
                    srNo++,
                    `Week ${week.week}: ${topic.title} ${topic.is_self_study ? '(Self Study)' : ''}`,
                    topic.duration_mins / 60,
                ]);
            });
        });

        autoTable(doc, {
            startY: 50,
            head: [['No.', 'Topics', 'Hours']],
            body: rows,
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249], textColor: 0, lineWidth: 0.1, fontStyle: 'bold' },
            styles: { fontSize: 10, cellPadding: 3 },
        });

        doc.save('academic_schedule.pdf');
    };

    return (
        <div className="space-y-8 animate-in fade-in duration-500">

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <MetricCard
                    label="Finish Date"
                    value={format(new Date(metrics.completion_date), 'MMM dd, yyyy')}
                    icon={CalendarRange}
                    isPrimary
                />
                <MetricCard
                    label="Total Weeks"
                    value={`${metrics.total_weeks} Weeks`}
                    icon={Activity}
                />
                <MetricCard
                    label="Total Lessons"
                    value={`${metrics.total_lectures} Units`}
                    icon={LayoutGrid}
                />
                <div className="flex items-center justify-center">
                    <Button onClick={handleDownloadPDF} className="h-full w-full rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 h-16 sm:h-auto">
                        <Download className="w-4 h-4 mr-2" /> Download PDF
                    </Button>
                </div>
            </div>

            {/* Weekly Schedule */}
            <div className="space-y-6">
                <div className="flex items-center justify-between px-2">
                    <h3 className="text-xl font-black text-foreground tracking-tight uppercase tracking-widest text-muted-foreground/60">Topic Timeline</h3>
                    <Badge variant="outline" className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 border-primary/20 text-primary bg-primary/5">
                        Plan Verified
                    </Badge>
                </div>

                <div className="space-y-12 relative">
                    {/* Timeline Line */}
                    <div className="absolute left-6 top-10 bottom-0 w-px bg-border/40 hidden md:block" />

                    {schedule.map((week: any, idx: number) => (
                        <div key={idx} className="relative md:pl-16 group">
                            {/* Week Indicator Dot */}
                            <div className="absolute left-6 top-0 -translate-x-1/2 w-4 h-4 rounded-full bg-primary border-4 border-background shadow-[0_0_10px_rgba(var(--primary),0.3)] z-10 hidden md:block transition-transform group-hover:scale-125" />

                            <div className="space-y-6">
                                <div className="flex items-center gap-4">
                                    <h4 className="text-xl font-black text-foreground tracking-tight">
                                        Week {week.week}: <span className="text-muted-foreground font-medium ml-2 text-base">{format(new Date(week.startDate), 'MMM dd')} - {format(new Date(week.endDate), 'MMM dd')}</span>
                                    </h4>
                                    <div className="h-px flex-1 bg-border/30" />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                                    {week.topics.map((topic: any, tIdx: number) => (
                                        <Card key={tIdx} className="hover:shadow-2xl hover:border-primary/20 transition-all duration-300 border-border/60 h-full flex flex-col justify-between rounded-2xl group/topic">
                                            <CardContent className="p-6 flex-1 flex flex-col justify-between">
                                                <div className="space-y-5">
                                                    <div className="flex justify-between items-start">
                                                        <div className={cn(
                                                            "w-10 h-10 rounded-xl flex items-center justify-center transition-colors",
                                                            topic.is_self_study ? "bg-amber-500/10 text-amber-500" : "bg-primary/10 text-primary"
                                                        )}>
                                                            {topic.is_self_study ? <Zap className="w-5 h-5 shadow-[0_0_10px_rgba(245,158,11,0.2)]" /> : <BookOpen className="w-5 h-5 shadow-[0_0_10px_rgba(var(--primary),0.2)]" />}
                                                        </div>
                                                        <Badge variant="secondary" className={cn(
                                                            "text-[9px] font-black uppercase tracking-widest border-none px-3 py-1 rounded-full",
                                                            topic.is_self_study ? "text-amber-600 bg-amber-500/5" : "text-primary bg-primary/5"
                                                        )}>
                                                            {topic.is_self_study ? 'Self Study' : 'Lecture'}
                                                        </Badge>
                                                    </div>

                                                    <h5 className="font-black text-foreground text-sm leading-tight group-hover/topic:text-primary transition-colors uppercase tracking-tight line-clamp-2">{topic.title}</h5>
                                                </div>

                                                <div className="pt-5 mt-5 border-t border-border/40 flex items-center justify-between">
                                                    <div className="flex items-center gap-2 text-muted-foreground/60">
                                                        <Clock className="w-4 h-4" />
                                                        <span className="text-[10px] font-black uppercase tracking-widest">{topic.duration_mins} Minutes</span>
                                                    </div>
                                                    {topic.scheduled_date && (
                                                        <div className="flex items-center gap-2 text-primary font-black">
                                                            <Sparkles className="w-4 h-4 opacity-50" />
                                                            <span className="text-[10px] font-black uppercase tracking-widest">{format(new Date(topic.scheduled_date), 'h:mm a')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function MetricCard({ label, value, icon: Icon, isPrimary }: any) {
    return (
        <Card className={cn("p-6 flex items-center gap-5 shadow-lg border-border/60 rounded-2xl transition-all hover:scale-[1.02]", isPrimary ? "bg-primary text-primary-foreground border-primary shadow-primary/20" : "bg-card")}>
            <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-inner", isPrimary ? "bg-white/20" : "bg-muted text-muted-foreground/40 border border-border/50")}>
                <Icon className="w-6 h-6" />
            </div>
            <div>
                <p className={cn("text-[10px] font-black uppercase tracking-widest mb-1.5 opacity-60", isPrimary ? "text-primary-foreground" : "text-muted-foreground")}>{label}</p>
                <div className="text-xl font-black tracking-tight leading-none">{value}</div>
            </div>
        </Card>
    );
}
