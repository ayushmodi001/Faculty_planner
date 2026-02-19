import Link from 'next/link';
import { Button } from '@/components/ui/SwissUI';
import {
  ArrowRight, Lock, GraduationCap, School, Users, Play, ChevronRight,
  Star, CheckCircle2, Clock, ShieldCheck, Zap, Globe, CalendarRange
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col font-sans text-foreground bg-background selection:bg-[#A6835B] selection:text-white overflow-x-hidden">

      {/* Navigation - Minimalist & Sticky */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#FEFAE0]/90 backdrop-blur-md border-b border-[#C9C3A3]/40">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tighter text-[#283618]">UAPS<span className="text-[#A6835B]">.</span></span>
          </div>

          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Solutions', 'Resources', 'Reviews'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="text-sm font-medium text-[#5C6836] hover:text-[#283618] transition-colors relative group">
                {item}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#A6835B] transition-all group-hover:w-full"></span>
              </a>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-[#283618] hover:underline underline-offset-4 hidden sm:block">
              Log in
            </Link>
            <Button size="default" className="rounded-full px-6 bg-[#283618] text-[#FEFAE0] hover:bg-[#5C6836] shadow-lg shadow-[#283618]/20">
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-32">
        {/* Subtle Grain Overlay */}
        <div className="fixed inset-0 pointer-events-none opacity-[0.03] mix-blend-multiply z-0" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}></div>

        {/* Hero Section */}
        <section className="container mx-auto px-6 mb-32 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7 pt-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#E9E5D0] border border-[#C9C3A3] text-[#5C6836] text-xs font-bold tracking-wide uppercase mb-8 shadow-sm">
                <div className="w-2 h-2 rounded-full bg-[#A6835B] animate-pulse"></div>
                <span>Syncs with Excel & Syllabus Velocity</span>
              </div>

              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.9] text-[#283618] mb-8">
                Academic <br />
                <span className="text-[#A6835B] font-serif italic pr-4 relative">
                  Rhythm
                  <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#C9C3A3] -z-10" viewBox="0 0 100 10" preserveAspectRatio="none">
                    <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="8" fill="none" opacity="0.3" />
                  </svg>
                </span>
                <br />
                Perfected.
              </h1>

              <p className="text-xl md:text-2xl text-[#5C6836] max-w-2xl leading-relaxed mb-10 font-medium">
                The centralized operating system for university scheduling. We replace chaos with <span className="text-[#A6835B] font-semibold">deterministic logic</span> and <span className="text-[#283618] font-semibold">AI foresight</span>.
              </p>

              <div className="flex flex-col sm:flex-row gap-5">
                <Button size="lg" className="rounded-full h-16 px-10 text-lg bg-[#A6835B] text-white hover:bg-[#8B6B48] shadow-xl shadow-[#A6835B]/30 hover:-translate-y-1 transition-all duration-300">
                  Deploy Now
                </Button>
                <Button variant="outline" size="lg" className="rounded-full h-16 px-10 text-lg border-[#283618] text-[#283618] hover:bg-[#283618] hover:text-[#FEFAE0] group transition-all duration-300">
                  <Play className="w-4 h-4 mr-2 fill-current group-hover:fill-[#FEFAE0]" />
                  See It In Action
                </Button>
              </div>

              <div className="mt-12 flex items-center gap-4 text-sm font-medium text-[#5C6836]">
                <div className="flex -space-x-2">
                  {[1, 2, 3, 4].map(i => (
                    <div key={i} className="w-8 h-8 rounded-full border-2 border-[#FEFAE0] bg-[#C9C3A3]" />
                  ))}
                </div>
                <p>Trusted by 500+ Faculty Members</p>
              </div>
            </div>

            {/* Visual Abstract - Right Side */}
            <div className="lg:col-span-5 relative h-[500px] lg:h-[700px] hidden lg:block">
              <div className="absolute inset-0 bg-[#E9E5D0] rounded-t-[200px] rounded-b-[40px] overflow-hidden border border-[#C9C3A3]/30">
                {/* Decorative Elements */}
                <div className="absolute top-20 right-20 w-32 h-32 bg-[#A6835B] rounded-full mix-blend-multiply opacity-80 animate-float" />
                <div className="absolute bottom-40 left-10 w-48 h-48 bg-[#5C6836] rounded-full mix-blend-multiply opacity-80 animate-float-delayed" />

                {/* Mockup Card */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] bg-white/60 backdrop-blur-xl border border-white/50 p-6 rounded-2xl shadow-2xl">
                  <div className="flex items-center justify-between mb-4 border-b border-[#5C6836]/10 pb-4">
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full bg-[#BC4749]" />
                      <div className="w-3 h-3 rounded-full bg-[#A6835B]" />
                      <div className="w-3 h-3 rounded-full bg-[#5C6836]" />
                    </div>
                    <div className="text-xs uppercase tracking-widest font-bold text-[#283618]">Smart Schedule</div>
                  </div>
                  <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex gap-3">
                        <div className="w-16 h-8 bg-[#283618]/5 rounded md" />
                        <div className="flex-1 h-8 bg-[#283618]/10 rounded md relative overflow-hidden">
                          <div className="absolute top-0 left-0 h-full bg-[#A6835B]/20 w-[60%]" />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* Marquee Section */}
        <div className="border-y border-[#C9C3A3]/30 py-10 bg-[#E9E5D0]/30 overflow-hidden mb-32">
          <div className="container mx-auto px-6">
            <p className="text-center text-xs font-bold tracking-[0.2em] uppercase text-[#5C6836] mb-8">Powering Academic Excellence At</p>
            <div className="flex justify-between items-center opacity-50 grayscale hover:grayscale-0 transition-grayscale duration-700 flex-wrap gap-8 justify-items-center">
              <h3 className="text-2xl font-serif font-bold text-[#283618]">Harvard</h3>
              <h3 className="text-2xl font-sans font-black text-[#283618]">Stanford.</h3>
              <h3 className="text-2xl font-mono font-bold text-[#283618]">MIT_EDU</h3>
              <h3 className="text-2xl font-serif italic text-[#283618]">Cambridge</h3>
              <h3 className="text-2xl font-sans font-bold text-[#283618]">Columbia</h3>
            </div>
          </div>
        </div>

        {/* Problem / Solution Section */}
        <section id="features" className="container mx-auto px-6 mb-40">
          <div className="max-w-4xl mx-auto text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-bold text-[#283618] mb-6 tracking-tight">Stop Scheduling in Chaos.</h2>
            <p className="text-xl text-[#5C6836] leading-relaxed">
              Traditional spreadsheets are static and prone to error. UAPS introduces a living, breathing timeline that adapts to faculty availability and syllabus progression in real-time.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-8 h-8 text-[#A6835B]" />,
                title: "Deterministic Timing",
                desc: "Conflict-free scheduling algorithm that respects room capacity and faculty load constraints automatically."
              },
              {
                icon: <Globe className="w-8 h-8 text-[#5C6836]" />,
                title: "Syllabus Velocity",
                desc: "AI tracks topic completion rates and adjusts future time slots to ensure the curriculum finishes on time."
              },
              {
                icon: <ShieldCheck className="w-8 h-8 text-[#283618]" />,
                title: "Role-Based Security",
                desc: "Granular access control for HODs, Faculty, and Students ensuring data integrity and privacy."
              }
            ].map((feature, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-[#C9C3A3]/20 hover:border-[#A6835B]/50 transition-colors shadow-sm hover:shadow-xl group">
                <div className="w-16 h-16 bg-[#FEFAE0] rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-2xl font-bold text-[#283618] mb-4">{feature.title}</h3>
                <p className="text-[#5C6836] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Feature Bento Grid (Portals) */}
        <section id="solutions" className="py-20 bg-[#283618] text-[#FEFAE0] rounded-t-[60px]">
          <div className="container mx-auto px-6 py-20">
            <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
              <div className="max-w-xl">
                <div className="text-[#A6835B] font-bold tracking-widest uppercase mb-4 text-sm">Ecosystem</div>
                <h2 className="text-4xl md:text-6xl font-bold mb-6">One Platform.<br />Four Perspectives.</h2>
                <p className="text-[#C9C3A3] text-lg">Every stakeholder gets a tailored experience. Secure, focused, and beautifully consistent.</p>
              </div>
              <Button variant="outline" className="border-[#A6835B] text-[#A6835B] hover:bg-[#A6835B] hover:text-white rounded-full px-8">
                View Documentation
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 h-auto md:h-[600px]">

              {/* Card 1: Faculty (Main) */}
              <Link href="/dashboard/faculty" className="md:col-span-8 md:row-span-2 bg-[#2f3e1b] rounded-3xl p-10 relative overflow-hidden group hover:bg-[#3a4c22] transition-colors border border-white/5">
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <div>
                    <div className="w-14 h-14 bg-[#A6835B] rounded-2xl flex items-center justify-center mb-8">
                      <GraduationCap className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-4xl font-bold mb-4">Faculty Portal</h3>
                    <p className="text-[#C9C3A3] text-xl max-w-md">The daily driver for professors. Manage lectures, mark attendance, and track syllabus completion with AI assistance.</p>
                  </div>
                  <div className="flex items-center gap-2 text-[#A6835B] font-bold text-lg mt-8">
                    Access Portal <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                  </div>
                </div>
                {/* Abstract Circle decoration */}
                <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-[#5C6836]/20 rounded-full blur-3xl" />
              </Link>

              {/* Card 2: HOD */}
              <Link href="/dashboard/hod" className="md:col-span-4 bg-[#FEFAE0] text-[#283618] rounded-3xl p-8 relative overflow-hidden group hover:scale-[1.02] transition-transform">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-[#283618] rounded-full flex items-center justify-center mb-4">
                    <Users className="w-6 h-6 text-[#FEFAE0]" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">HOD Controls</h3>
                  <p className="text-[#5C6836] text-sm leading-tight">Allocate subjects, approve leaves, and manage departmental load.</p>
                </div>
                <ChevronRight className="absolute bottom-6 right-6 w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity translate-x-[-10px] group-hover:translate-x-0" />
              </Link>

              {/* Card 3: Student */}
              <Link href="/dashboard/student" className="md:col-span-4 bg-[#5C6836] text-white rounded-3xl p-8 relative overflow-hidden group hover:bg-[#6b7941] transition-colors">
                <div className="relative z-10">
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2">Student View</h3>
                  <p className="text-[#C9C3A3] text-sm leading-tight">Access timetables, resource materials, and exam schedules.</p>
                </div>
              </Link>

            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section id="reviews" className="py-32 container mx-auto px-6">
          <div className="flex flex-col items-center text-center max-w-3xl mx-auto">
            <Star className="w-12 h-12 text-[#A6835B] fill-current mb-8" />
            <h3 className="text-3xl md:text-5xl font-serif italic text-[#283618] mb-10 leading-tight">
              "UAPS has completely transformed how we handle the academic calendar. The deterministic scheduling engine is a masterpiece of logic."
            </h3>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-[#C9C3A3] rounded-full" />
              <div className="text-left">
                <p className="font-bold text-[#283618]">Dr. Elena Rostova</p>
                <p className="text-[#5C6836] text-sm uppercase tracking-wider font-semibold">Dean of Engineering, MIT</p>
              </div>
            </div>
          </div>
        </section>

        {/* Big CTA */}
        <section className="py-20 px-6 mb-20">
          <div className="container mx-auto bg-[#E9E5D0] rounded-[3rem] p-12 md:p-24 text-center relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full opacity-10" style={{
              backgroundImage: "radial-gradient(#5C6836 1px, transparent 1px)",
              backgroundSize: "30px 30px"
            }} />

            <div className="relative z-10">
              <h2 className="text-4xl md:text-6xl font-bold text-[#283618] mb-8">Ready to synchronize?</h2>
              <p className="text-xl text-[#5C6836] mb-12 max-w-2xl mx-auto">Join a network of forward-thinking institutions using UAPS to drive academic excellence.</p>
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Button size="lg" className="rounded-full h-16 px-12 text-xl bg-[#283618] text-[#FEFAE0] hover:bg-[#283618]/90">
                  Get Started
                </Button>
                <Button variant="ghost" size="lg" className="rounded-full h-16 px-12 text-xl text-[#283618] hover:bg-[#283618]/10">
                  Contact Sales
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Detailed Footer */}
        <footer className="bg-[#1e2912] text-[#FEFAE0] pt-20 pb-10 border-t border-[#5C6836]/30">
          <div className="container mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
              <div className="col-span-1 md:col-span-2">
                <h2 className="text-3xl font-bold tracking-tighter mb-6 text-[#C9C3A3]">UAPS.</h2>
                <p className="text-[#C9C3A3]/60 max-w-md text-lg">
                  Engineered for the academic future. Determined by data. Powered by Intelligence.
                </p>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-[#A6835B]">Platform</h4>
                <ul className="space-y-4 text-[#FEFAE0]/70">
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Faculty Portal</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Student Portal</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Admin Console</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">API Documentation</a></li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-6 text-[#A6835B]">Company</h4>
                <ul className="space-y-4 text-[#FEFAE0]/70">
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">About Us</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Careers</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Legal</a></li>
                  <li><a href="#" className="hover:text-[#A6835B] transition-colors">Contact</a></li>
                </ul>
              </div>
            </div>

            <div className="pt-8 border-t border-[#FEFAE0]/10 flex flex-col md:flex-row justify-between items-center text-sm text-[#FEFAE0]/40">
              <p>© 2026 UAPS Inc. All rights reserved.</p>
              <div className="flex gap-8 mt-4 md:mt-0">
                <Globe className="w-5 h-5 hover:text-[#A6835B] cursor-pointer transition-colors" />
                <ShieldCheck className="w-5 h-5 hover:text-[#A6835B] cursor-pointer transition-colors" />
              </div>
            </div>
          </div>
        </footer>

      </main>
    </div>
  );
}
