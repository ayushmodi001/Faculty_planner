import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, BarChart3, GraduationCap, Users2, TrendingUp, CalendarRange, Building2, MapPin } from 'lucide-react';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function PrincipalDashboard() {
    return (
        <DashboardLayout role="Principal">
            {/* Header Section */}
            <div className="mb-12 max-w-2xl animate-in slide-in-from-bottom-5 duration-500">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9E5D0] text-[#5C6836] text-xs font-bold uppercase tracking-wider mb-4 border border-[#C9C3A3]">
                    <Building2 className="w-3 h-3" />
                    University Overview
                </div>
                <SwissHeading className="text-4xl md:text-6xl mb-4 text-[#283618]">Executive Board</SwissHeading>
                <p className="text-lg text-[#5C6836] leading-relaxed max-w-xl">
                    Real-time institutional oversight, faculty load balancing, and academic calendar management.
                </p>
            </div>

            {/* Quick Access Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in slide-in-from-bottom-10 duration-700 delay-100">

                {/* User & Faculty Management */}
                <Link href="/admin/users" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#283618] transition-colors duration-300 shadow-inner">
                                    <Users2 className="w-6 h-6 text-[#283618] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">User & Faculty</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Create accounts for HODs, Faculty, and Students.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Faculty Groups / Load */}
                <Link href="/admin/faculty" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#5C6836] transition-colors duration-300 shadow-inner">
                                    <GraduationCap className="w-6 h-6 text-[#5C6836] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Faculty Groups</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Oversee teaching groups and subject allocations.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Planner */}
                <Link href="/admin/planner" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#A6835B] transition-colors duration-300 shadow-inner">
                                    <BarChart3 className="w-6 h-6 text-[#A6835B] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Smart Planner</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Generate and review academic plans.
                            </p>
                        </CardContent>
                    </Card>
                </Link>

                {/* Academic Calendar */}
                <Link href="/admin/calendar" className="group">
                    <Card className="h-full border-none shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/80 backdrop-blur rounded-[24px] overflow-hidden">
                        <CardHeader className="pb-2">
                            <div className="flex justify-between items-start mb-2">
                                <div className="p-3 bg-[#E9E5D0] rounded-2xl group-hover:bg-[#283618] transition-colors duration-300 shadow-inner">
                                    <CalendarRange className="w-6 h-6 text-[#283618] group-hover:text-[#FEFAE0]" />
                                </div>
                                <ArrowRight className="w-5 h-5 text-[#C9C3A3] group-hover:text-[#A6835B] -rotate-45 group-hover:rotate-0 transition-transform duration-300" />
                            </div>
                            <CardTitle className="text-xl text-[#283618]">Academic Calendar</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-[#5C6836] mb-4 font-medium">
                                Set holidays and override working days.
                            </p>
                        </CardContent>
                    </Card>
                </Link>
            </div>

            {/* Department Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in slide-in-from-bottom-10 duration-700 delay-200 mb-12">
                <Card className="border-none shadow-lg rounded-[24px] bg-white ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="border-b border-[#C9C3A3]/20 bg-[#FEFAE0]/30">
                        <div className="flex justify-between items-center">
                            <SwissHeading className="text-xl text-[#283618]">Department Performance</SwissHeading>
                            <Button variant="outline" size="sm" className="rounded-full border-[#C9C3A3] text-[#5C6836] hover:bg-[#283618] hover:text-[#FEFAE0] text-xs">Download Report</Button>
                        </div>
                    </CardHeader>
                    <div className="p-0">
                        <div className="px-6 py-3 bg-[#E9E5D0]/30 border-b border-[#C9C3A3]/20 text-xs font-bold text-[#5C6836] uppercase tracking-wider grid grid-cols-12 gap-4">
                            <div className="col-span-6">Department</div>
                            <div className="col-span-3 text-center">Faculty</div>
                            <div className="col-span-3 text-right">Completion</div>
                        </div>
                        {[
                            { name: "Computer Science", faculty: 24, progress: 92, bg: "bg-green-500" },
                            { name: "Mechanical Engg.", faculty: 18, progress: 85, bg: "bg-orange-500" },
                            { name: "Electrical Engg.", faculty: 20, progress: 88, bg: "bg-blue-500" },
                            { name: "Civil Engineering", faculty: 16, progress: 78, bg: "bg-red-500" },
                        ].map((dept, i) => (
                            <div key={i} className="px-6 py-4 border-b border-[#C9C3A3]/10 last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-[#FEFAE0]/50 transition-colors cursor-default">
                                <div className="col-span-6 flex items-center gap-3">
                                    <div className="p-2 bg-[#E9E5D0] rounded-lg text-[#283618]">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <span className="font-bold text-[#283618] text-sm">{dept.name}</span>
                                </div>
                                <div className="col-span-3 text-center text-sm font-medium text-[#5C6836]">{dept.faculty}</div>
                                <div className="col-span-3 text-right flex items-center justify-end gap-2">
                                    <div className="w-16 h-1.5 bg-[#E9E5D0] rounded-full overflow-hidden">
                                        <div className={`h-full ${dept.bg}`} style={{ width: `${dept.progress}%` }}></div>
                                    </div>
                                    <span className="text-xs font-bold text-[#283618]">{dept.progress}%</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card className="border-none shadow-lg rounded-[24px] bg-white ring-1 ring-black/5 overflow-hidden">
                    <CardHeader className="border-b border-[#C9C3A3]/20 bg-[#FEFAE0]/30">
                        <div className="flex justify-between items-center">
                            <SwissHeading className="text-xl text-[#283618]">Recent Administrative Actions</SwissHeading>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 pt-6">
                        <div className="flex gap-4 group p-2 hover:bg-[#FEFAE0]/50 rounded-xl transition-colors -mx-2">
                            <div className="mt-1">
                                <div className="w-3 h-3 rounded-full bg-[#A6835B] ring-4 ring-[#A6835B]/20 group-hover:ring-[#A6835B]/40 transition-all"></div>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-[#283618]">HOD Computer Science approved new syllabus</p>
                                <p className="text-xs text-[#5C6836] mt-0.5 font-medium">Updated "Advanced AI" curriculum modules.</p>
                                <p className="text-[10px] text-[#C9C3A3] mt-1 font-mono uppercase tracking-widest">Today, 9:00 AM</p>
                            </div>
                        </div>
                        <div className="flex gap-4 group p-2 hover:bg-[#FEFAE0]/50 rounded-xl transition-colors -mx-2">
                            <div className="mt-1">
                                <div className="w-3 h-3 rounded-full bg-[#5C6836] ring-4 ring-[#5C6836]/20 group-hover:ring-[#5C6836]/40 transition-all"></div>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-[#283618]">Calendar Updated by Registrar</p>
                                <p className="text-xs text-[#5C6836] mt-0.5 font-medium">Added "Founder's Day" as a restricted holiday.</p>
                                <p className="text-[10px] text-[#C9C3A3] mt-1 font-mono uppercase tracking-widest">Yesterday</p>
                            </div>
                        </div>
                        <div className="flex gap-4 group p-2 hover:bg-[#FEFAE0]/50 rounded-xl transition-colors -mx-2">
                            <div className="mt-1">
                                <div className="w-3 h-3 rounded-full bg-[#BC4749] ring-4 ring-[#BC4749]/20 group-hover:ring-[#BC4749]/40 transition-all"></div>
                            </div>
                            <div>
                                <p className="font-bold text-sm text-[#283618]">Low Attendance Alert - Civil Dept</p>
                                <p className="text-xs text-[#5C6836] mt-0.5 font-medium">Automated flag raised for 3rd Year Civil.</p>
                                <p className="text-[10px] text-[#C9C3A3] mt-1 font-mono uppercase tracking-widest">2 days ago</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </DashboardLayout>
    );
}
