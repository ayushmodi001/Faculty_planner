import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, Clock, MapPin, BookOpen, AlertCircle } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function FacultyDashboard() {
    return (
        <DashboardLayout role="Faculty">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4 animate-in slide-in-from-bottom-5 duration-500">
                <div className="max-w-2xl">
                    <SwissSubHeading className="mb-2 text-primary">Your Schedule</SwissSubHeading>
                    <SwissHeading className="text-4xl">Welcome back, Prof. Thorne</SwissHeading>
                    <p className="text-lg text-muted-foreground mt-2">
                        You have <span className="font-bold text-foreground">3 lectures</span> scheduled for today.
                    </p>
                </div>
                <Button size="lg" className="shadow-lg shadow-primary/20">View Full Timetable</Button>
            </div>

            {/* Today's Timeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                <div className="lg:col-span-2 space-y-6">
                    <SwissHeading className="text-2xl mb-4">Today's Lectures</SwissHeading>

                    {/* Active Class Card */}
                    <div className="relative pl-8 border-l-2 border-primary space-y-8">
                        <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-primary ring-4 ring-primary/20"></div>

                        <Card className="bg-primary text-primary-foreground border-none shadow-xl transform scale-[1.02] transition-transform">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">Now Active</Badge>
                                    <span className="font-mono text-sm opacity-80">09:30 AM - 10:30 AM</span>
                                </div>
                                <CardTitle className="text-2xl mt-2">Data Structures & Algo</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center gap-4 text-sm opacity-90 mb-6">
                                    <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> LH-102</div>
                                    <div className="flex items-center gap-1"><Users2 className="w-4 h-4" /> CS-Sem3-A</div>
                                </div>

                                <div className="p-4 bg-white/10 rounded-lg border border-white/10">
                                    <p className="text-xs uppercase tracking-wider font-bold opacity-70 mb-1">Today's Topic</p>
                                    <p className="font-medium text-lg">Introduction to Red-Black Trees</p>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Upcoming Class */}
                        <div className="relative">
                            <div className="absolute -left-[41px] top-2 w-4 h-4 rounded-full bg-muted border-2 border-muted-foreground"></div>
                            <Card className="opacity-80 hover:opacity-100 transition-opacity">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start">
                                        <Badge variant="secondary">Upcoming</Badge>
                                        <span className="font-mono text-sm text-muted-foreground">11:15 AM - 12:15 PM</span>
                                    </div>
                                    <CardTitle className="text-xl mt-2">Operating Systems Code</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                        <div className="flex items-center gap-1"><MapPin className="w-4 h-4" /> LAB-3</div>
                                        <div className="flex items-center gap-1"><Users2 className="w-4 h-4" /> CS-Sem5-B</div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>

                {/* Right Sidebar */}
                <div className="space-y-6">
                    <SwissHeading className="text-2xl mb-4">Quick Actions</SwissHeading>
                    <div className="grid gap-4">
                        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Update Syllabus</p>
                                    <p className="text-xs text-muted-foreground">Log lecture completion</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="hover:border-primary/50 cursor-pointer transition-colors">
                            <CardContent className="flex items-center gap-4 pt-6">
                                <div className="p-2 bg-orange-100 text-orange-600 rounded-lg">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="font-medium">Report Issue</p>
                                    <p className="text-xs text-muted-foreground">Flag scheduling conflict</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="p-6 bg-slate-100 rounded-xl border border-slate-200 mt-8">
                        <h4 className="font-bold text-slate-800 mb-2">Did you know?</h4>
                        <p className="text-sm text-slate-600 leading-relaxed">
                            The AI engine has optimized your schedule to free up Thursday afternoons for research work based on your preferences.
                        </p>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}

function Users2({ className }: { className?: string }) {
    return (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>
    )
}
