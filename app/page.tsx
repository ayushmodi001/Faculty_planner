import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  ArrowRight, Lock, GraduationCap, Users, Play, ChevronRight,
  Star, CheckCircle2, Clock, ShieldCheck, Globe, CalendarDays,
  LayoutDashboard, BookOpen
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background selection:bg-primary selection:text-primary-foreground overflow-x-hidden">
      {/* Dynamic Grid Background - subtle */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Navigation - Minimalist & Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/60 backdrop-blur-xl border-b border-border/40 supports-[backdrop-filter]:bg-background/40">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-foreground text-background flex items-center justify-center font-bold text-xl tracking-tighter">
              U
            </div>
            <span className="text-xl font-bold tracking-tight">UAPS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Platform', 'Solutions', 'Resources', 'Enterprise'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative group">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <ModeToggle />
            <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors hidden sm:block">
              Sign In
            </Link>
            <Button size="sm" className="rounded-full px-5 font-semibold">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32 pb-20 relative z-10 block">

        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-32 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[600px] bg-primary/20 blur-[120px] rounded-full opacity-50 pointer-events-none dark:opacity-20"></div>

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto pt-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted border border-border text-foreground text-xs font-semibold tracking-wide uppercase mb-8 shadow-sm hover:scale-105 transition-transform cursor-default">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <span>UAPS Engine v2.0 is Live</span>
            </div>

            <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.95] mb-8 text-foreground drop-shadow-sm">
              Academic <span className="text-transparent bg-clip-text bg-gradient-to-r from-neutral-400 to-neutral-800 dark:from-neutral-200 dark:to-neutral-600">Rhythm</span><br /> Perfected.
            </h1>

            <p className="text-xl text-muted-foreground max-w-2xl leading-relaxed mb-10 font-medium">
              The centralized operating system for modern universities. We replace chaos with deterministic logic and AI foresight. Plan, structure, and execute seamlessly.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
              <Button size="lg" className="rounded-full h-14 px-8 text-lg shadow-xl hover:-translate-y-1 transition-all duration-300">
                Deploy Environment
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg group transition-all duration-300">
                <Play className="w-4 h-4 mr-2" />
                View Demo
              </Button>
            </div>

            {/* Visual Dashboard Mockup Abstract */}
            <div className="mt-20 w-full relative">
              <div className="w-full h-48 md:h-96 rounded-t-3xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl overflow-hidden relative">
                {/* Mock Header */}
                <div className="h-12 border-b border-border/50 flex items-center px-6 gap-4 opacity-70">
                  <div className="w-3 h-3 rounded-full bg-red-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                </div>
                {/* Mock Content Grid */}
                <div className="p-8 grid grid-cols-3 gap-6 opacity-30">
                  <div className="h-32 rounded-xl bg-foreground/5"></div>
                  <div className="h-32 rounded-xl bg-foreground/10 col-span-2"></div>
                  <div className="h-48 rounded-xl bg-foreground/10 col-span-3"></div>
                </div>
                {/* Gradient fade out at bottom */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-background to-transparent"></div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Bento Grid */}
        <section id="platform" className="container mx-auto px-6 mb-40">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4 text-foreground">A unified nervous system.</h2>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">Everything you need to orchestrate thousands of students, faculty, and subjects in perfect harmony.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Feature 1 */}
            <div className="md:col-span-2 bg-muted/30 border border-border/50 rounded-3xl p-8 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-foreground text-background flex items-center justify-center mb-6">
                <CalendarDays className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold mb-3">Deterministic Scheduling</h3>
              <p className="text-muted-foreground leading-relaxed max-w-md">Our conflict-resolution engine respects room capacities, faculty availability, and prerequisites—generating flawless timetables instantly.</p>
            </div>
            {/* Feature 2 */}
            <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">AI Syllabus</h3>
              <p className="text-muted-foreground leading-relaxed">Simply upload PDF syllabuses. The AI parses topics and allocates them across available teaching slots automatically.</p>
            </div>
            {/* Feature 3 */}
            <div className="bg-muted/30 border border-border/50 rounded-3xl p-8 hover:bg-muted/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">RBAC Security</h3>
              <p className="text-muted-foreground leading-relaxed">Granular permissions for Admins, HODs, Faculty, and Students. Data stays isolated and secure.</p>
            </div>
            {/* Feature 4 */}
            <div className="md:col-span-2 bg-foreground text-background rounded-3xl p-8 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-background/10 blur-3xl -mr-10 -mt-10 rounded-full transition-transform duration-700 group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="w-12 h-12 rounded-xl bg-background/20 text-background flex items-center justify-center mb-6">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-bold mb-3">Role-Specific Dashboards</h3>
                <p className="text-background/80 leading-relaxed max-w-md">Every stakeholder logs into a curated environment. HODs see faculty loads; Students see their daily agenda; Faculty mark progressions.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section id="solutions" className="py-24 border-y border-border/40 bg-muted/10 relative">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">One Platform.<br />Multiple Perspectives.</h2>
                <p className="text-muted-foreground text-lg">Four dedicated portals giving each role exactly the tools they need.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { title: 'Admin', desc: 'System configuration, user management, and global calendar settings.', icon: <ShieldCheck />, link: '/dashboard/admin' },
                { title: 'HOD', desc: 'Faculty load balancing, curriculum tracking, and department oversight.', icon: <Users />, link: '/dashboard/hod' },
                { title: 'Faculty', desc: 'Daily lecture timelines, topic progression, and schedule viewing.', icon: <GraduationCap />, link: '/dashboard/faculty' },
                { title: 'Student', desc: 'Personalized timetables, subjective progress tracking, and notifications.', icon: <Lock />, link: '/dashboard/student' }
              ].map((portal, i) => (
                <Link key={i} href={portal.link} className="group flex flex-col justify-between p-8 rounded-3xl border border-border/50 bg-card hover:border-primary/50 hover:shadow-lg transition-all">
                  <div>
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-6 group-hover:scale-110 group-hover:bg-primary group-hover:text-primary-foreground transition-all">
                      {portal.icon}
                    </div>
                    <h3 className="text-xl font-bold mb-3">{portal.title} Portal</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{portal.desc}</p>
                  </div>
                  <div className="pt-8 flex items-center text-sm font-semibold opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all">
                    Explore <ArrowRight className="ml-2 w-4 h-4" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32 px-6">
          <div className="container mx-auto max-w-5xl bg-foreground text-background rounded-[40px] p-12 md:p-24 text-center relative overflow-hidden">
            {/* Decorative */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff10_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:24px_24px]"></div>

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold mb-6 tracking-tight">Ready to synchronize?</h2>
              <p className="text-lg text-background/70 mb-10 max-w-xl mx-auto">Join forward-thinking institutions using UAPS to eliminate academic friction and drive excellence.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-background text-foreground hover:bg-background/90">
                  Deploy Now
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-background/20 hover:bg-background/10 text-background">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-border/40 py-12 bg-background z-10 relative">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-foreground text-background flex items-center justify-center font-bold text-xs tracking-tighter">
              U
            </div>
            <span className="font-bold tracking-tight">UAPS © 2026</span>
          </div>

          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link href="#" className="hover:text-foreground transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-foreground transition-colors">API Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
