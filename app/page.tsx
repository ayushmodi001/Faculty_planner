import Link from 'next/link';
import { Logo } from '@/components/ui/Logo';
import { Button } from '@/components/ui/SwissUI';
import { ArrowRight, Lock, GraduationCap, School, Users, Play, ChevronRight, Star } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background selection:bg-secondary selection:text-white">

      {/* Navigation - Minimalist & Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-primary">UAPS</span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Solutions', 'Resources', 'Pricing'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                {item}
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium hover:underline underline-offset-4 hidden sm:block">
              Log in
            </Link>
            <Button size="default" className="rounded-full px-6 bg-primary text-primary-foreground hover:bg-primary/90">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32">
        {/* Helper Gradient Overlay */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 blur-[120px] rounded-full pointer-events-none -z-10" />

        {/* Hero Section - Awwwards Style: Large Typo + Asymmetry */}
        <section className="container mx-auto px-6 mb-32">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold tracking-wide uppercase mb-8">
                <Star className="w-3 h-3 fill-current" />
                <span>Award Winning Academic Planner</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-bold tracking-tighter leading-[0.9] text-primary mb-8">
                Academic <br />
                <span className="text-accent italic font-serif pr-4">Harmony</span>
                <br />
                Engineered.
              </h1>

              <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl leading-relaxed mb-10">
                The operating system for modern universities. We combine deterministic scheduling with AI-driven syllabus tracking to create perfect academic synchronization.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="rounded-full h-14 px-8 text-lg bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 transition-transform duration-300">
                  Start Planning Now
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-14 px-8 text-lg border-primary/20 hover:bg-secondary/5 group">
                  <Play className="w-4 h-4 mr-2 fill-current group-hover:text-secondary" />
                  Watch Showreel
                </Button>
              </div>
            </div>

            {/* Abstract Visual Right */}
            <div className="lg:col-span-4 relative h-[400px] lg:h-[600px] hidden lg:block">
              {/* Abstract Composition */}
              <div className="absolute top-10 right-0 w-64 h-96 bg-primary rounded-tr-[100px] rounded-bl-[100px] z-10" />
              <div className="absolute top-32 right-32 w-48 h-48 bg-secondary rounded-full mix-blend-multiply opacity-90 z-20 animate-pulse" />
              <div className="absolute bottom-20 right-10 w-40 h-80 bg-accent rounded-t-full z-0 opacity-80" />

              <div className="absolute bottom-10 left-0 bg-white/80 backdrop-blur border p-4 rounded-xl shadow-2xl z-30 max-w-[200px]">
                <p className="text-sm font-bold text-primary mb-1">Efficiency Up</p>
                <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                  <div className="h-full bg-secondary w-[85%]" />
                </div>
                <p className="text-xs text-muted-foreground mt-2">+85% this semester</p>
              </div>
            </div>

          </div>
        </section>

        {/* Marquee / Social Proof */}
        <div className="border-y border-border/40 py-8 bg-muted/30 overflow-hidden">
          <div className="container mx-auto px-6">
            <p className="text-center text-sm font-semibold tracking-widest uppercase text-muted-foreground mb-6">Trusted by leading institutions</p>
            <div className="flex justify-between items-center opacity-60 grayscale hover:grayscale-0 transition-all duration-500">
              {/* Placeholders for logos */}
              <div className="text-xl font-serif font-bold">Cambridge</div>
              <div className="text-xl font-sans font-black">MIT</div>
              <div className="text-xl font-mono font-bold">STANFORD</div>
              <div className="text-xl font-serif italic">Oxford</div>
              <div className="text-xl font-sans font-bold">ETH Zürich</div>
            </div>
          </div>
        </div>

        {/* Bento Grid Portals */}
        <section id="solutions" className="py-32 container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-bold text-primary mb-6">Unified Access Control.</h2>
            <p className="text-lg text-muted-foreground">Every stakeholder gets a tailored experience. Secure, role-based, and beautifully consistent.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-auto md:h-[600px]">

            {/* Card 1: Large Left */}
            <Link href="/dashboard/faculty" className="md:col-span-2 md:row-span-2 group relative overflow-hidden rounded-3xl bg-secondary text-white p-10 transition-all hover:scale-[0.99]">
              <div className="relative z-10 h-full flex flex-col justify-between">
                <div>
                  <div className="w-12 h-12 bg-white/20 backdrop-blur rounded-full flex items-center justify-center mb-6">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-3xl font-bold mb-2">Faculty Portal</h3>
                  <p className="text-white/80 max-w-md">Manage lectures, track syllabus completion, and view your personalized timetable with AI assistance.</p>
                </div>
                <div className="flex items-center gap-2 font-medium mt-8">
                  Access Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
              {/* Decorative Circle */}
              <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-primary/20 rounded-full blur-3xl group-hover:bg-primary/30 transition-colors" />
            </Link>

            {/* Card 2: Top Right */}
            <Link href="/dashboard/principal" className="group relative overflow-hidden rounded-3xl bg-muted p-8 transition-all hover:bg-border/50">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                  <School className="w-5 h-5 text-primary" />
                </div>
                <h3 className="text-xl font-bold text-primary mb-1">Principal</h3>
                <p className="text-sm text-muted-foreground">Oversight & Analytics</p>
              </div>
              <ChevronRight className="absolute bottom-8 right-8 w-6 h-6 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Card 3: Middle Right */}
            <Link href="/dashboard/hod" className="group relative overflow-hidden rounded-3xl bg-[#F0F4FF] p-8 transition-all hover:bg-[#E0E7FF]">
              <div className="relative z-10">
                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Users className="w-5 h-5 text-blue-700" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">HOD</h3>
                <p className="text-sm text-slate-600">Resource Management</p>
              </div>
              <ChevronRight className="absolute bottom-8 right-8 w-6 h-6 text-slate-800 opacity-0 group-hover:opacity-100 transition-opacity" />
            </Link>

            {/* Card 4: Bottom Right (Student) */}
            <Link href="/dashboard/student" className="group relative overflow-hidden rounded-3xl bg-accent text-white p-8 transition-all hover:bg-accent/90">
              <div className="relative z-10 w-full">
                <div className="flex justify-between items-start w-full">
                  <div>
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Lock className="w-5 h-5 text-white" />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-1">Student</h3>
                  </div>
                  <ArrowRight className="w-5 h-5 text-white -rotate-45 group-hover:rotate-0 transition-transform" />
                </div>
                <p className="text-sm text-white/80 mt-2">View schedules & attendance</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-primary text-primary-foreground py-20">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row justify-between items-start mb-16">
              <div>
                <h2 className="text-3xl font-bold tracking-tighter mb-6">UAPS</h2>
                <p className="text-white/60 max-w-xs">Engineered for the academic future. Determined by data. Powered by Intelligence.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-12 mt-10 md:mt-0">
                <div>
                  <h4 className="font-bold mb-4">Platform</h4>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li><a href="#" className="hover:text-white">Features</a></li>
                    <li><a href="#" className="hover:text-white">Pricing</a></li>
                    <li><a href="#" className="hover:text-white">API</a></li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-bold mb-4">Company</h4>
                  <ul className="space-y-2 text-sm text-white/60">
                    <li><a href="#" className="hover:text-white">About</a></li>
                    <li><a href="#" className="hover:text-white">Careers</a></li>
                    <li><a href="#" className="hover:text-white">Blog</a></li>
                  </ul>
                </div>
              </div>
            </div>
            <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-sm text-white/40">
              <p>© 2026 UAPS Inc. All rights reserved.</p>
              <div className="flex gap-6 mt-4 md:mt-0">
                <a href="#" className="hover:text-white">Privacy Policy</a>
                <a href="#" className="hover:text-white">Terms of Service</a>
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
