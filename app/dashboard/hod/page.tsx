import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, LayoutDashboard, CalendarRange, Users, BookOpen, Bell, Wand2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HODDashboard() {
    return (
        <DashboardLayout role="HOD">
            {/* Header Section */}
            <div className="mb-12 max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="mb-2 text-primary">Department Administration</SwissSubHeading>
                <SwissHeading className="text-4xl md:text-5xl mb-4">Computer Science & Engg.</SwissHeading>
                <p className="text-lg md:text-xl text-muted-foreground leading-relaxed">
                    Manage your department's faculty, teaching loads, and academic calendar.
                </p>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* User Management Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>Administration</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">User & Faculty</CardTitle>
                            <div className="p-1 bg-primary/10 rounded">
                                <Users className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Add Faculty, Students, and Staff via Form or Excel Upload.
                        </div>
                        <Link href="/admin/users">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Manage Users <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Subject Management Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>Curriculum</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Subjects Registry</CardTitle>
                            <div className="p-1 bg-primary/10 rounded">
                                <BookOpen className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Define global subjects and codes for the department.
                        </div>
                        <Link href="/admin/subjects">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Manage Subjects <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Faculty Groups Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>Core function</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Faculty Groups</CardTitle>
                            <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Assign subjects, create teaching groups, and monitor load.
                        </div>
                        <Link href="/admin/faculty">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Access Portal <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Timetable Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>Scheduling</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Semester Timetable</CardTitle>
                            <CalendarRange className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Define weekly master schedules for all faculty groups/sections.
                        </div>
                        <Link href="/admin/timetable">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Manage Schedule <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Smart Planner Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>AI Engine</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Smart Planner</CardTitle>
                            <div className="p-1 bg-primary/10 rounded">
                                <Wand2 className="w-5 h-5 text-primary" />
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Generate optimized lesson plans from raw syllabus text.
                        </div>
                        <Link href="/admin/planner">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Launch Planner <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Calendar Module */}
                <Card className="hover:border-primary/50 transition-colors group cursor-pointer h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading>Planning</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Academic Calendar</CardTitle>
                            <CalendarRange className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="mb-4 text-sm text-muted-foreground">
                            Set holidays and override working days for the semester.
                        </div>
                        <Link href="/admin/calendar">
                            <Button variant="outline" className="w-full justify-between mt-auto">
                                Manage Dates <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    </CardContent>
                </Card>

                {/* Stats Card - Faculty */}
                <Card className="bg-primary text-primary-foreground border-primary h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <div className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest">Active Staff</div>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-3xl font-bold">24</CardTitle>
                            <Users className="w-5 h-5 opacity-80" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm opacity-90 mb-4">
                            Professors and Assistant Professors currently active.
                        </div>
                        <div className="pt-4 border-t border-white/20 flex gap-2 mt-auto">
                            <Badge className="bg-white/20 text-white hover:bg-white/30 border-none">100% Availability</Badge>
                        </div>
                    </CardContent>
                </Card>

                {/* Stats Card - AI Engine */}
                <Card className="h-full flex flex-col justify-between">
                    <CardHeader className="pb-2">
                        <SwissSubHeading className="text-green-600">AI Engine Status</SwissSubHeading>
                        <div className="flex justify-between items-start">
                            <CardTitle className="text-xl">Online</CardTitle>
                            <div className="relative flex h-3 w-3">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground mb-4">
                            Syllabus parsing and optimization services active.
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <div className="flex items-center text-xs font-medium text-muted-foreground">
                                <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> Mistral-7B
                            </div>
                        </div>
                    </CardContent>
                </Card>

            </div>

            {/* Lower Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                        <SwissHeading className="text-2xl">Pending Syllabi Reviews</SwissHeading>
                        <Button variant="ghost" size="sm">View All</Button>
                    </div>
                    <Card>
                        <div className="p-0 overflow-x-auto">
                            <div className="border-b px-6 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider grid grid-cols-12 gap-4 min-w-[600px]">
                                <div className="col-span-6">Subject</div>
                                <div className="col-span-3">Faculty</div>
                                <div className="col-span-3 text-right">Status</div>
                            </div>
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="px-6 py-4 border-b last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-muted/20 transition-colors min-w-[600px]">
                                    <div className="col-span-6">
                                        <div className="font-medium">Data Structures & Algo</div>
                                        <div className="text-xs text-muted-foreground">CS-Sem5 • Mod {i + 1}</div>
                                    </div>
                                    <div className="col-span-3 text-sm">Dr. Aris Thorne</div>
                                    <div className="col-span-3 text-right flex justify-end">
                                        <Badge variant={i === 0 ? 'success' : 'warning'}>
                                            {i === 0 ? 'Approved' : 'Pending AI Scan'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div>
                    <SwissHeading className="text-2xl mb-4">System Alerts</SwissHeading>
                    <Card>
                        <CardContent className="pt-6 space-y-6">
                            <div className="flex gap-4 items-start">
                                <div className="bg-blue-50 p-2 rounded-full text-primary shrink-0">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Holiday Added: Diwali</p>
                                    <p className="text-xs text-muted-foreground mt-1">Calendar updated. Slot regeneration required for affected groups.</p>
                                    <p className="text-xs text-muted-foreground mt-2 font-mono">2h ago</p>
                                </div>
                            </div>
                            <div className="border-t border-dashed"></div>
                            <div className="flex gap-4 items-start">
                                <div className="bg-orange-50 p-2 rounded-full text-orange-600 shrink-0">
                                    <BookOpen className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium">Syllabus Deviation</p>
                                    <p className="text-xs text-muted-foreground mt-1">Prof. Smith is lagging by 2 lectures in "Operating Systems".</p>
                                    <p className="text-xs text-muted-foreground mt-2 font-mono">5h ago</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
