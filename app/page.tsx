import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading, Badge } from '@/components/ui/SwissUI';
import { ArrowRight, LayoutDashboard, CalendarRange, Users, BookOpen, Bell } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px]">

      {/* Navigation Bar */}
      <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-primary rounded flex items-center justify-center text-white font-bold">U</div>
            <span className="font-bold text-lg tracking-tight">UAPS <span className="text-muted-foreground font-normal">Enterprise</span></span>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">Documentation</Button>
            <div className="w-px h-4 bg-border"></div>
            <Button variant="ghost" size="sm">Support</Button>
            <Button size="sm">Sign In</Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-4 py-12">

        {/* Header Section */}
        <div className="mb-12 max-w-2xl">
          <SwissSubHeading className="mb-2 text-primary">Academic Session 2026-2027</SwissSubHeading>
          <SwissHeading className="text-5xl mb-4">University Academic Planning System</SwissHeading>
          <p className="text-xl text-muted-foreground leading-relaxed">
            The centralized hub for adaptive syllabus tracking, automated scheduling, and resource allocation.
          </p>
        </div>

        {/* Quick Access Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">

          {/* HOD Module */}
          <Card className="hover:border-primary/50 transition-colors group cursor-pointer">
            <CardHeader className="pb-2">
              <SwissSubHeading>Administration</SwissSubHeading>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">HOD Dashboard</CardTitle>
                <LayoutDashboard className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Manage Faculty Groups, assign subjects, and approve syllabus plans.
              </div>
              <Link href="/admin/faculty">
                <Button variant="outline" className="w-full justify-between">
                  Access Portal <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Calendar Module */}
          <Card className="hover:border-primary/50 transition-colors group cursor-pointer">
            <CardHeader className="pb-2">
              <SwissSubHeading>Configuration</SwissSubHeading>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Academic Calendar</CardTitle>
                <CalendarRange className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 text-sm text-muted-foreground">
                Set semester timelines, holidays, and working day overrides.
              </div>
              <Link href="/admin/calendar">
                <Button variant="outline" className="w-full justify-between">
                  Manage Dates <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>

          {/* Stats Card Idea 1 */}
          <Card className="bg-primary text-primary-foreground border-primary">
            <CardHeader className="pb-2">
              <div className="text-primary-foreground/80 text-xs font-bold uppercase tracking-widest">Active Faculty</div>
              <div className="flex justify-between items-start">
                <CardTitle className="text-3xl font-bold">124</CardTitle>
                <Users className="w-5 h-5 opacity-80" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm opacity-90">
                Total configured faculty members across 8 departments.
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 flex gap-2">
                <Badge className="bg-white/20 text-white hover:bg-white/30">98% Active</Badge>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card Idea 2 */}
          <Card>
            <CardHeader className="pb-2">
              <SwissSubHeading className="text-green-600">System Status</SwissSubHeading>
              <div className="flex justify-between items-start">
                <CardTitle className="text-xl">Operational</CardTitle>
                <div className="relative flex h-3 w-3">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-4">
                All AI reasoning engines and database shards are healthy.
              </div>
              <div className="flex gap-2">
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> MongoDB
                </div>
                <div className="flex items-center text-xs font-medium text-muted-foreground">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span> OpenRouter
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        {/* Recent Activity / Table Stub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <SwissHeading className="text-2xl">Recent Syllabus Updates</SwissHeading>
              <Button variant="ghost" size="sm">View All</Button>
            </div>
            <Card>
              <div className="p-0">
                <div className="border-b px-6 py-3 bg-muted/40 text-xs font-medium text-muted-foreground uppercase tracking-wider grid grid-cols-12 gap-4">
                  <div className="col-span-6">Subject</div>
                  <div className="col-span-3">Faculty</div>
                  <div className="col-span-3 text-right">Status</div>
                </div>
                {[1, 2, 3].map((_, i) => (
                  <div key={i} className="px-6 py-4 border-b last:border-0 grid grid-cols-12 gap-4 items-center hover:bg-muted/20 transition-colors">
                    <div className="col-span-6">
                      <div className="font-medium">Data Structures & Algo</div>
                      <div className="text-xs text-muted-foreground">CS-Sem5 • Mod 3</div>
                    </div>
                    <div className="col-span-3 text-sm">Dr. Aris Thorne</div>
                    <div className="col-span-3 text-right">
                      <Badge variant={i === 0 ? 'success' : 'warning'}>
                        {i === 0 ? 'On Track' : 'Pending Review'}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div>
            <SwissHeading className="text-2xl mb-4">Notifications</SwissHeading>
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="bg-blue-100 p-2 rounded-full text-primary">
                    <Bell className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Semester Start Date Updated</p>
                    <p className="text-xs text-muted-foreground mt-1">Admin changed the start date to July 15th.</p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">2h ago</p>
                  </div>
                </div>
                <div className="border-t"></div>
                <div className="flex gap-4 items-start">
                  <div className="bg-orange-100 p-2 rounded-full text-orange-600">
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New Pattern Detected</p>
                    <p className="text-xs text-muted-foreground mt-1">AI engine suggests splitting "Graph Theory" into 2 lectures.</p>
                    <p className="text-xs text-muted-foreground mt-2 font-mono">5h ago</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

      </main>
    </div>
  );
}
