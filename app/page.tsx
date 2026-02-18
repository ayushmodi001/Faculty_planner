import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { ArrowRight, Lock, GraduationCap, School, Users } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">

      {/* Navigation */}
      <nav className="border-b bg-background/90 backdrop-blur sticky top-0 z-50">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Logo size="md" />
          </div>
          <div className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#roles" className="text-sm font-medium hover:text-primary transition-colors">Portals</a>
            <Button size="sm">Request Demo</Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-20 md:py-32 px-6">
          <div className="container mx-auto text-center max-w-4xl">
            <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-blue-100 text-blue-800 hover:bg-blue-200 mb-6">
              Now with AI Syllabus Parsing
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-700 pb-2">
              Academic Planning, <br className="hidden md:block" /> Reimagined.
            </h1>
            <p className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              The centralized operating system for modern universities. Automate scheduling, track syllabus velocity, and optimize faculty load with deterministic precision.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="h-12 px-8 text-base">Get Started</Button>
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">View Documentation</Button>
            </div>
          </div>
        </section>

        {/* Role Selection Grid */}
        <section id="roles" className="py-20 bg-slate-50 border-t border-b">
          <div className="container mx-auto px-6">
            <div className="text-center mb-16">
              <SwissSubHeading className="mb-2 text-primary">Secure Access</SwissSubHeading>
              <SwissHeading className="text-3xl md:text-4xl">Select Your Portal</SwissHeading>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">

              {/* Principal */}
              <Link href="/dashboard/principal" className="group">
                <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-slate-900 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <School className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">Principal</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Executive dashboard for institutional oversight and high-level reports.
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Login <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* HOD */}
              <Link href="/dashboard/hod" className="group">
                <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <Users className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">Head of Dept.</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Manage faculty loads, approve syllabi, and configure calendars.
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Login <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Faculty */}
              <Link href="/dashboard/faculty" className="group">
                <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <GraduationCap className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">Faculty</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      Track lectures, update daily logs, and view personal timetable.
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Login <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Student */}
              <Link href="/dashboard/student" className="group">
                <Card className="h-full hover:shadow-xl hover:border-primary/20 transition-all duration-300">
                  <CardHeader>
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform">
                      <Lock className="w-6 h-6" />
                    </div>
                    <CardTitle className="text-xl">Student</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-6">
                      View class schedules, attendance, and upcoming assignments.
                    </p>
                    <div className="flex items-center text-blue-600 font-medium text-sm group-hover:translate-x-1 transition-transform">
                      Login <ArrowRight className="w-4 h-4 ml-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>

            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-white py-12 border-t">
          <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center text-sm text-muted-foreground">
            <div>
              © 2026 UAPS Enterprise. Built for the Future of Education.
            </div>
            <div className="flex gap-6 mt-4 md:mt-0">
              <a href="#" className="hover:text-foreground">Privacy</a>
              <a href="#" className="hover:text-foreground">Terms</a>
              <a href="#" className="hover:text-foreground">Contact</a>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
