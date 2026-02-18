import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, Book, Calendar, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function StudentDashboard() {
    return (
        <DashboardLayout role="Student">
            {/* Header Section */}
            <div className="mb-12 max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="mb-2 text-primary">Student Portal</SwissSubHeading>
                <SwissHeading className="text-4xl md:text-5xl mb-4">My Academics</SwissHeading>
                <p className="text-lg text-muted-foreground">
                    Computer Science • Semester 5 • Section A
                </p>
            </div>

            {/* Classes Today */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">
                <Card className="bg-slate-900 text-white border-none col-span-1 md:col-span-2 relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-32 bg-primary/20 blur-3xl rounded-full translate-x-12 -translate-y-12"></div>
                    <CardHeader>
                        <Badge className="w-fit bg-primary/80 mb-2">Next Calculation</Badge>
                        <CardTitle className="text-3xl">Applied Mathematics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="opacity-80 mb-6">Topic: Eigenvalues and Eigenvectors</p>
                        <div className="flex gap-4 text-sm font-mono">
                            <span>10:30 AM</span>
                            <span className="opacity-50">|</span>
                            <span>Lecture Hall 4</span>
                        </div>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <SwissSubHeading>Attendance</SwissSubHeading>
                        <CardTitle className="text-4xl text-green-600">89%</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">You are safely above the 75% threshold.</p>
                    </CardContent>
                </Card>

                <Card className="flex flex-col justify-between">
                    <CardHeader>
                        <SwissSubHeading>Assignments</SwissSubHeading>
                        <CardTitle className="text-4xl">2</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-xs text-muted-foreground">Due this week: OS Lab, Algo Sheet.</p>
                    </CardContent>
                </Card>
            </div>

            {/* Course Progress */}
            <div className="animate-in slide-in-from-bottom-10 duration-700 delay-200">
                <SwissHeading className="text-2xl mb-6">Course Progress</SwissHeading>
                <div className="space-y-4">
                    {[
                        { subject: "Data Structures", progress: 75, color: "bg-blue-600" },
                        { subject: "Operating Systems", progress: 60, color: "bg-orange-500" },
                        { subject: "Computer Networks", progress: 45, color: "bg-purple-600" },
                        { subject: "Dbms", progress: 90, color: "bg-green-600" }
                    ].map((course, i) => (
                        <div key={i} className="bg-card border rounded-lg p-4 flex items-center gap-4 hover:shadow-sm transition-shadow">
                            <div className={`p-3 rounded-lg ${course.color} bg-opacity-10 text-foreground`}>
                                <Book className="w-5 h-5 opacity-80" />
                            </div>
                            <div className="flex-1">
                                <div className="flex justify-between mb-2">
                                    <span className="font-medium">{course.subject}</span>
                                    <span className="text-sm font-bold text-muted-foreground">{course.progress}%</span>
                                </div>
                                <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                    <div className={`h-full ${course.color} rounded-full`} style={{ width: `${course.progress}%` }}></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </DashboardLayout>
    );
}
