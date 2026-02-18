import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, BarChart3, GraduationCap, Users2, TrendingUp } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PrincipalDashboard() {
    return (
        <DashboardLayout role="Principal">
            {/* Header Section */}
            <div className="mb-12 max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="mb-2 text-primary">University Overview</SwissSubHeading>
                <SwissHeading className="text-4xl md:text-5xl mb-4">Executive Dashboard</SwissHeading>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Real-time insights into academic progress, faculty load, and institutional performance metrics.
                </p>
            </div>

            {/* High Level Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                <Card className="bg-gradient-to-br from-slate-900 to-slate-800 text-white border-none shadow-lg">
                    <CardHeader>
                        <SwissSubHeading className="text-slate-400">Total Enrollment</SwissSubHeading>
                        <CardTitle className="text-4xl mt-2">12,450</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center text-sm text-green-400 mt-2">
                            <TrendingUp className="w-4 h-4 mr-2" /> +5.2% from last year
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-primary">
                    <CardHeader>
                        <SwissSubHeading>Syllabus Velocity</SwissSubHeading>
                        <CardTitle className="text-4xl mt-2">87%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Overall average syllabus completion across all departments compared to expected timeline.
                        </p>
                    </CardContent>
                </Card>

                <Card className="border-l-4 border-l-green-500">
                    <CardHeader>
                        <SwissSubHeading>Faculty Engagement</SwissSubHeading>
                        <CardTitle className="text-4xl mt-2">98.5%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">
                            Daily active faculty leveraging the digital planning tools.
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Department Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200">
                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <SwissHeading className="text-xl">Department Performance</SwissHeading>
                            <Button variant="ghost" size="sm">Download Report</Button>
                        </div>
                    </CardHeader>
                    <div className="p-0">
                        <div className="border-b px-6 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider grid grid-cols-12 gap-4">
                            <div className="col-span-6">Department</div>
                            <div className="col-span-3 text-center">Faculty</div>
                            <div className="col-span-3 text-right">Completion</div>
                        </div>
                        {[
                            { name: "Computer Science", faculty: 24, progress: 92, status: "success" },
                            { name: "Mechanical Engg.", faculty: 18, progress: 85, status: "warning" },
                            { name: "Electrical Engg.", faculty: 20, progress: 88, status: "success" },
                            { name: "Civil Engineering", faculty: 16, progress: 78, status: "destructive" },
                        ].map((dept, i) => (
                            <div key={i} className="px-6 py-4 border-b last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-muted/10 transition-colors">
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="p-2 bg-muted rounded-md text-muted-foreground">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <span className="font-medium">{dept.name}</span>
                                </div>
                                <div className="col-span-3 text-center text-sm">{dept.faculty}</div>
                                <div className="col-span-3 text-right">
                                    <Badge variant={dept.status as any}>{dept.progress}%</Badge>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <SwissHeading className="text-xl">Recent Administrative Actions</SwissHeading>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-blue-500 ring-4 ring-blue-100"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">HOD Computer Science approved new syllabus</p>
                                <p className="text-xs text-muted-foreground">Updated "Advanced AI" curriculum modules.</p>
                                <p className="text-xs text-muted-foreground mt-1">Today, 9:00 AM</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 ring-4 ring-green-100"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Calendar Updated by Registrar</p>
                                <p className="text-xs text-muted-foreground">Added "Founder's Day" as a restricted holiday.</p>
                                <p className="text-xs text-muted-foreground mt-1">Yesterday</p>
                            </div>
                        </div>
                        <div className="flex gap-4">
                            <div className="mt-1">
                                <div className="w-2 h-2 rounded-full bg-orange-500 ring-4 ring-orange-100"></div>
                            </div>
                            <div>
                                <p className="font-medium text-sm">Low Attendance Alert - Civil Dept</p>
                                <p className="text-xs text-muted-foreground">Automated flag raised for 3rd Year Civil.</p>
                                <p className="text-xs text-muted-foreground mt-1">2 days ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
