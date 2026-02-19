import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, LayoutDashboard, CalendarRange, Users, BookOpen, Bell, Wand2, TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function HODDashboard() {
    return (
        <DashboardLayout role="HOD">
            {/* Header Section */}
            <div className="mb-12 max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E5D0] text-[#5C6836] text-xs font-bold uppercase tracking-wider mb-4 border border-[#C9C3A3]">
                    <span className="w-2 h-2 rounded-full bg-[#283618] animate-pulse"></span>
                    Live Dashboard
                </div>
                <SwissHeading className="text-4xl md:text-6xl mb-4 text-[#283618]">Computer Science</SwissHeading>
                <p className="text-lg text-[#5C6836] leading-relaxed max-w-xl">
                    Command center for faculty load distribution, curriculum velocity, and automated scheduling.
                </p>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* User Management Module */}
                <Link href="/admin/users" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#283618] transition-colors duration-300 shadow-inner">
                                    <Users className="w-6 h-6 text-[#283618] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">User & Faculty</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Onboard staff, manage roles, and review profiles.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Subject Management Module */}
                <Link href="/admin/subjects" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#5C6836] transition-colors duration-300 shadow-inner">
                                    <BookOpen className="w-6 h-6 text-[#5C6836] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Curriculum</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Define master subjects, codes, and credit values.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Faculty Groups Module */}
                <Link href="/admin/faculty" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#A6835B] transition-colors duration-300 shadow-inner">
                                    <LayoutDashboard className="w-6 h-6 text-[#A6835B] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Faculty Load</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Create teaching groups and assign subject experts.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Timetable Module */}
                <Link href="/admin/timetable" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#283618] transition-colors duration-300 shadow-inner">
                                    <CalendarRange className="w-6 h-6 text-[#283618] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Master Schedule</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Generate and view weekly timetables for all sections.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Stats Card - Faculty Impact */}
                <Card className="bg-[#283618] text-[#FEFAE0] border-none shadow-xl col-span-1 md:col-span-2 rounded-[24px] relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#5C6836] rounded-full mix-blend-screen opacity-20 -mr-16 -mt-16 blur-3xl group-hover:scale-110 transition-transform duration-700"></div>
                    <CardHeader className="pb-2 relative z-10">
                        <div className="text-[#A6835B] text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Resources
                        </div>
                        <div className="flex justify-between items-end mt-4">
                            <div>
                                <CardTitle className="text-5xl font-black tracking-tight text-white mb-1">24</CardTitle>
                                <div className="text-[#C9C3A3] font-medium">Active Professors</div>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-[#A6835B]">98%</div>
                                <div className="text-xs text-[#C9C3A3] font-medium uppercase">Load Capacity</div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        {/* Visual Progress Bar */}
                        <div className="w-full h-2 bg-white/10 rounded-full mt-4 overflow-hidden">
                            <div className="h-full bg-[#A6835B] w-[98%] shadow-[0_0_15px_#A6835B]" />
                        </div>
                    </CardContent>
                </Card>

                {/* AI Engine Status */}
                <Card className="bg-[#FEFAE0] border-[#C9C3A3] border col-span-1 md:col-span-2 rounded-[24px] shadow-sm relative overflow-hidden group hover:border-[#A6835B] transition-colors">
                    <CardHeader className="pb-2">
                        <div className="flex justify-between items-center">
                            <div className="inline-flex items-center gap-2 px-2 py-1 bg-[#283618]/10 rounded-lg text-[#283618] text-xs font-bold border border-[#283618]/20">
                                <Wand2 className="w-3 h-3" /> AI Engine
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                                </span>
                                <span className="text-xs font-bold text-[#283618]">ONLINE</span>
                            </div>
                        </div>
                        <div className="mt-8 flex gap-8 justify-between px-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#283618]">1.2s</div>
                                <div className="text-[10px] text-[#5C6836] font-bold uppercase tracking-widest">Latency</div>
                            </div>
                            <div className="w-px bg-[#C9C3A3]/50 h-10"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#283618]">99.9%</div>
                                <div className="text-[10px] text-[#5C6836] font-bold uppercase tracking-widest">Uptime</div>
                            </div>
                            <div className="w-px bg-[#C9C3A3]/50 h-10"></div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-[#283618]">450</div>
                                <div className="text-[10px] text-[#5C6836] font-bold uppercase tracking-widest">Ops/Hr</div>
                            </div>
                        </div>
                    </CardHeader>
                </Card>

            </div>

            {/* Lower Section - Styled Tables and Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200 mb-12">
                <div className="lg:col-span-2">
                    <div className="flex items-center justify-between mb-6">
                        <SwissHeading className="text-2xl text-[#283618]">Pending Approvals</SwissHeading>
                        <Button variant="outline" size="sm" className="rounded-full border-[#C9C3A3] text-[#5C6836] hover:bg-[#283618] hover:text-[#FEFAE0] transition-colors">View All</Button>
                    </div>
                    <Card className="border-none shadow-lg overflow-hidden rounded-[24px] bg-white ring-1 ring-black/5">
                        <div className="p-0 overflow-x-auto">
                            <div className="px-6 py-4 bg-[#E9E5D0]/30 border-b border-[#C9C3A3]/20 text-xs font-bold text-[#5C6836] uppercase tracking-wider grid grid-cols-12 gap-4 min-w-[600px]">
                                <div className="col-span-5">Subject Details</div>
                                <div className="col-span-3">Faculty</div>
                                <div className="col-span-2 text-center">Load</div>
                                <div className="col-span-2 text-right">Action</div>
                            </div>
                            {[1, 2, 3].map((_, i) => (
                                <div key={i} className="px-6 py-4 border-b border-[#C9C3A3]/10 last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-[#FEFAE0]/50 transition-colors min-w-[600px] group cursor-pointer">
                                    <div className="col-span-5">
                                        <div className="font-bold text-[#283618] text-base group-hover:text-[#A6835B] transition-colors">Data Structures & Algo</div>
                                        <div className="text-xs text-[#5C6836] mt-1 font-medium">CS-Sem5 • Mod {i + 1}</div>
                                    </div>
                                    <div className="col-span-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-full bg-[#E9E5D0] flex items-center justify-center text-xs font-bold text-[#283618] ring-2 ring-white">
                                                AT
                                            </div>
                                            <span className="text-sm font-semibold text-[#283618]">Dr. Aris Thorne</span>
                                        </div>
                                    </div>
                                    <div className="col-span-2 text-center">
                                        <Badge variant="outline" className="border-[#C9C3A3] text-[#5C6836] bg-[#FEFAE0]">45%</Badge>
                                    </div>
                                    <div className="col-span-2 text-right flex justify-end">
                                        <Button size="sm" className="h-8 rounded-full bg-[#283618] text-[#FEFAE0] hover:bg-[#5C6836] text-xs shadow-md">
                                            Review
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </Card>
                </div>

                <div>
                    <SwissHeading className="text-2xl mb-6 text-[#283618]">System Alerts</SwissHeading>
                    <Card className="border-none shadow-lg rounded-[24px] bg-white h-auto ring-1 ring-black/5">
                        <CardContent className="pt-6 space-y-6">

                            <div className="flex gap-4 items-start group hover:bg-[#FEFAE0]/50 p-2 rounded-xl transition-colors -mx-2">
                                <div className="bg-[#E9E5D0] p-3 rounded-2xl text-[#283618] shrink-0 group-hover:bg-[#A6835B] group-hover:text-white transition-colors shadow-sm">
                                    <Bell className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#283618]">Holiday Added: Diwali</p>
                                    <p className="text-xs text-[#5C6836] mt-1 leading-relaxed font-medium">Calendar updated. Slot regeneration required.</p>
                                    <p className="text-[10px] text-[#C9C3A3] mt-2 font-mono uppercase tracking-widest">2h ago</p>
                                </div>
                            </div>

                            <div className="w-full h-px bg-[#C9C3A3]/20"></div>

                            <div className="flex gap-4 items-start group hover:bg-[#FEFAE0]/50 p-2 rounded-xl transition-colors -mx-2">
                                <div className="bg-[#E9E5D0] p-3 rounded-2xl text-[#283618] shrink-0 group-hover:bg-[#BC4749] group-hover:text-white transition-colors shadow-sm">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#283618]">Syllabus Deviation</p>
                                    <p className="text-xs text-[#5C6836] mt-1 leading-relaxed font-medium">Prof. Smith is lagging by 2 lectures.</p>
                                    <p className="text-[10px] text-[#C9C3A3] mt-2 font-mono uppercase tracking-widest">5h ago</p>
                                </div>
                            </div>

                            <div className="w-full h-px bg-[#C9C3A3]/20"></div>

                            <div className="flex gap-4 items-start group hover:bg-[#FEFAE0]/50 p-2 rounded-xl transition-colors -mx-2">
                                <div className="bg-[#E9E5D0] p-3 rounded-2xl text-[#283618] shrink-0 group-hover:bg-[#5C6836] group-hover:text-white transition-colors shadow-sm">
                                    <CheckCircle2 className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-[#283618]">Timetable Export</p>
                                    <p className="text-xs text-[#5C6836] mt-1 leading-relaxed font-medium">Weekly schedule exported via Excel.</p>
                                    <p className="text-[10px] text-[#C9C3A3] mt-2 font-mono uppercase tracking-widest">Yesterday</p>
                                </div>
                            </div>

                        </CardContent>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}
