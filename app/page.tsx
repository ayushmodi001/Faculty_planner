import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ModeToggle } from '@/components/mode-toggle';
import {
  ArrowRight, Lock, GraduationCap, Users, CheckCircle2,
  ShieldCheck, CalendarDays, LayoutDashboard, BookOpen,
  Sparkles, BrainCircuit, Zap, Activity, TrendingUp,
  Building2, BarChart3, ClipboardCheck, ChevronRight, Network
} from 'lucide-react';
import { Logo } from '@/components/ui/Logo';
import { cn } from '@/lib/utils';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import Subject from '@/models/Subject';
import FacultyGroup from '@/models/FacultyGroup';
import Plan from '@/models/Plan';
import Department from '@/models/Department';

export const dynamic = 'force-dynamic';

async function getLandingStats() {
  try {
    await dbConnect();
    await import('@/models/User');
    await import('@/models/Subject');

    const [facultyCount, studentCount, subjectCount, groupCount, departmentCount] = await Promise.all([
      User.countDocuments({ role: 'FACULTY', isActive: true }),
      User.countDocuments({ role: 'STUDENT', isActive: true }),
      Subject.countDocuments(),
      FacultyGroup.countDocuments(),
      Department.countDocuments(),
    ]);

    const planAgg = await Plan.aggregate([
      { $match: { status: 'ACTIVE' } },
      {
        $project: {
          done: {
            $size: {
              $filter: {
                input: { $ifNull: ['$syllabus_topics', []] },
                as: 't',
                cond: { $eq: ['$$t.completion_status', 'DONE'] }
              }
            }
          },
          total: { $size: { $ifNull: ['$syllabus_topics', []] } }
        }
      },
      {
        $group: {
          _id: null,
          totalDone: { $sum: '$done' },
          totalTopics: { $sum: '$total' },
          planCount: { $sum: 1 }
        }
      }
    ]);

    const stats = planAgg[0] || { totalDone: 0, totalTopics: 0, planCount: 0 };
    const avgCompletion = stats.totalTopics > 0
      ? Math.round((stats.totalDone / stats.totalTopics) * 100)
      : 0;

    return { facultyCount, studentCount, subjectCount, groupCount, departmentCount, avgCompletion, activePlans: stats.planCount };
  } catch {
    return { facultyCount: 0, studentCount: 0, subjectCount: 0, groupCount: 0, departmentCount: 0, avgCompletion: 0, activePlans: 0 };
  }
}

export default async function LandingPage() {
  const stats = await getLandingStats();

  return (
    <div className="min-h-screen flex flex-col font-sans text-slate-900 bg-white selection:bg-blue-100 selection:text-blue-700 overflow-x-hidden">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-b border-slate-200/60 shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5 group">
            <Logo size="md" showText={false} className="shrink-0" />
            <span className="hidden sm:block text-xs font-black uppercase tracking-widest text-slate-400">
              Acad<span className="text-blue-600">Planner</span>
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Roles', 'Analytics'].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`}
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-blue-600 transition-colors">
                {item}
              </a>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-blue-600 transition-colors hidden sm:block">
              Staff Login
            </Link>
            <Link href="/login">
              <Button size="sm" className="rounded-xl px-5 bg-blue-600 hover:bg-blue-700">
                Portal Login
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <main className="flex-1 pt-24">

        {/* ── Hero ─────────────────────────────────────────────────────── */}
        <section className="container mx-auto px-6 pt-12 pb-20 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-[10px] font-black uppercase tracking-widest mb-8">
            <Sparkles className="w-3.5 h-3.5" />
            AI-Powered University Academic Planner
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-950 mb-6 max-w-4xl leading-[1.05]">
            Streamline your institution&apos;s{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-violet-600">
              academic planning.
            </span>
          </h1>

          <p className="text-lg text-slate-500 max-w-2xl leading-relaxed mb-10 font-medium">
            An AI-powered platform for faculty, HODs, and principals to manage timetables,
            track syllabus coverage, and get real-time academic insights — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-16">
            <Link href="/login">
              <Button size="lg" className="rounded-2xl px-10 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 group">
                Access your Dashboard
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <a href="#features">
              <Button variant="outline" size="lg" className="rounded-2xl px-10 border-slate-200 hover:bg-slate-50">
                Explore Features
              </Button>
            </a>
          </div>

          {/* Live Stats Strip */}
          <div className="w-full max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Faculty Members', value: stats.facultyCount || '–', icon: Users, color: 'blue' },
              { label: 'Active Plans', value: stats.activePlans || '–', icon: CalendarDays, color: 'violet' },
              { label: 'Subjects', value: stats.subjectCount || '–', icon: BookOpen, color: 'emerald' },
              { label: 'Avg Completion', value: stats.avgCompletion > 0 ? `${stats.avgCompletion}%` : '–', icon: TrendingUp, color: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className={cn(
                "p-5 rounded-2xl border text-center transition-all hover:-translate-y-1",
                stat.color === 'blue' ? "bg-blue-50/50 border-blue-100" :
                  stat.color === 'violet' ? "bg-violet-50/50 border-violet-100" :
                    stat.color === 'emerald' ? "bg-emerald-50/50 border-emerald-100" :
                      "bg-amber-50/50 border-amber-100"
              )}>
                <stat.icon className={cn("w-5 h-5 mx-auto mb-2",
                  stat.color === 'blue' ? 'text-blue-500' :
                    stat.color === 'violet' ? 'text-violet-500' :
                      stat.color === 'emerald' ? 'text-emerald-500' : 'text-amber-500'
                )} />
                <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ──────────────────────────────────────────────────── */}
        <section id="features" className="bg-slate-50/70 border-y border-slate-200/60 py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-3">Platform Capabilities</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Everything your institution needs.</h2>
              <p className="text-slate-500 font-medium max-w-xl mx-auto mt-3 leading-relaxed">
                From AI plan generation to multi-year analytics — built for modern universities.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                {
                  icon: BrainCircuit, title: 'AI Plan Generation',
                  desc: 'Upload a syllabus, and the AI generates a complete term lecture schedule — optimized against holidays and your timetable.',
                  color: 'blue'
                },
                {
                  icon: CalendarDays, title: 'Smart Timetable Editor',
                  desc: 'Drag-and-drop weekly slot editor with faculty conflict detection, Excel import/export, and automatic plan sync on changes.',
                  color: 'violet'
                },
                {
                  icon: BarChart3, title: 'Real-time Analytics',
                  desc: 'Year-wise, semester-wise, and department-wise dashboards showing live syllabus completion rates and missed topic alerts.',
                  color: 'emerald'
                },
                {
                  icon: ClipboardCheck, title: 'Topic Tracking',
                  desc: 'Faculty mark topics as Done, Missed, or Continued. The system automatically reschedules affected upcoming topics.',
                  color: 'amber'
                },
                {
                  icon: Network, title: 'Multi-Role Access',
                  desc: 'Dedicated portals for Principal, HOD, Faculty, and Student — each with role-appropriate views and access controls.',
                  color: 'rose'
                },
                {
                  icon: Building2, title: 'Department Management',
                  desc: 'Principals can manage departments, assign HODs, track faculty across wings, and view cross-departmental progress.',
                  color: 'cyan'
                },
              ].map((f) => (
                <FeatureCard key={f.title} {...f} />
              ))}
            </div>
          </div>
        </section>

        {/* ── Roles ─────────────────────────────────────────────────────── */}
        <section id="roles" className="py-24">
          <div className="container mx-auto px-6">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-600 mb-3">Role-based Access</p>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Dedicated portals for every role.</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  title: 'Principal', icon: ShieldCheck, color: 'bg-blue-600',
                  features: ['Institution-wide analytics', 'Department management', 'Cross-dept performance', 'Academic calendar control'],
                },
                {
                  title: 'Head of Dept. (HOD)', icon: LayoutDashboard, color: 'bg-violet-600',
                  features: ['Year/semester breakdown', 'Faculty workload view', 'Cohort progress tracking', 'Plan review & approval'],
                },
                {
                  title: 'Faculty', icon: Zap, color: 'bg-emerald-600',
                  features: ['Today\'s schedule', 'Topic completion marking', 'Syllabus progress view', 'Leave/conflict reports'],
                },
                {
                  title: 'Student', icon: BookOpen, color: 'bg-amber-500',
                  features: ['Daily timetable', 'Syllabus coverage view', 'Faculty info', 'Academic calendar'],
                },
              ].map((role) => (
                <Link key={role.title} href="/login">
                  <div className="group p-6 rounded-3xl border border-slate-200 hover:border-slate-300 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
                    <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 shadow-lg", role.color)}>
                      <role.icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-4">{role.title}</h3>
                    <ul className="space-y-2 flex-1">
                      {role.features.map((f) => (
                        <li key={f} className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          {f}
                        </li>
                      ))}
                    </ul>
                    <div className="mt-6 flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-blue-600 opacity-60 group-hover:opacity-100 transition-all">
                      Enter Portal <ChevronRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* ── Analytics Preview ──────────────────────────────────────────── */}
        <section id="analytics" className="bg-slate-950 py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(37,99,235,0.15),transparent_60%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(139,92,246,0.1),transparent_60%)]" />
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center mb-14">
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400 mb-3">Live Data</p>
              <h2 className="text-3xl font-black text-white tracking-tight">Academic Analytics, Visualized.</h2>
              <p className="text-slate-400 font-medium max-w-xl mx-auto mt-3 leading-relaxed">
                From topic completion rates to department-wise breakdowns — every metric surfaces automatically.
              </p>
            </div>

            {/* Live stat cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
              {[
                { label: 'Departments', value: stats.departmentCount, color: 'blue' },
                { label: 'Cohorts', value: stats.groupCount, color: 'violet' },
                { label: 'Students', value: stats.studentCount, color: 'cyan' },
                { label: 'Completion Rate', value: stats.avgCompletion > 0 ? `${stats.avgCompletion}%` : 'N/A', color: 'emerald' },
              ].map((s) => (
                <div key={s.label} className="p-5 rounded-2xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-all">
                  <p className="text-3xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mt-1">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Decorative progress bars */}
            <div className="max-w-3xl mx-auto space-y-4">
              {[
                { label: 'Year 1 – Foundational Subjects', pct: 72, color: 'bg-blue-500' },
                { label: 'Year 2 – Core Engineering', pct: 58, color: 'bg-violet-500' },
                { label: 'Year 3 – Specialization', pct: 84, color: 'bg-emerald-500' },
                { label: 'Year 4 – Final Year Projects', pct: 45, color: 'bg-amber-500' },
              ].map((item) => (
                <div key={item.label} className="space-y-2">
                  <div className="flex justify-between text-xs font-black">
                    <span className="text-white/70">{item.label}</span>
                    <span className="text-white">{item.pct}%</span>
                  </div>
                  <div className="h-2.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/login">
                <Button size="lg" className="rounded-2xl px-10 bg-white text-slate-900 hover:bg-slate-100 font-black group shadow-2xl">
                  View Your Real Analytics
                  <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* ── CTA ───────────────────────────────────────────────────────── */}
        <section className="py-24 container mx-auto px-6 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-500/30">
              <Activity className="w-8 h-8" />
            </div>
            <h2 className="text-4xl font-black text-slate-900 tracking-tight mb-5">
              Ready to modernize your academic operations?
            </h2>
            <p className="text-slate-500 font-medium leading-relaxed mb-10 max-w-xl mx-auto">
              Contact your system administrator to create your account.
              The platform is live and ready for the current academic session.
            </p>
            <Link href="/login">
              <Button size="lg" className="rounded-2xl px-12 bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/20 group">
                Login to your Portal
                <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200/60 bg-slate-50/50">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2.5">
            <Logo size="sm" showText={false} className="opacity-60 grayscale" />
            <span className="text-xs font-black uppercase tracking-widest text-slate-400">University Academic Planning System</span>
          </div>
          <div className="flex gap-8 text-[10px] font-black uppercase tracking-widest text-slate-400">
            <a href="#" className="hover:text-blue-600 transition-colors">Support</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
            <a href="#" className="hover:text-blue-600 transition-colors">Documentation</a>
          </div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-300">
            © 2026 University Academic System
          </p>
        </div>
      </footer>
    </div>
  );
}

function FeatureCard({ icon: Icon, title, desc, color }: any) {
  const colors: any = {
    blue: 'bg-blue-50 text-blue-600 border-blue-100',
    violet: 'bg-violet-50 text-violet-600 border-violet-100',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    amber: 'bg-amber-50 text-amber-600 border-amber-100',
    rose: 'bg-rose-50 text-rose-600 border-rose-100',
    cyan: 'bg-cyan-50 text-cyan-600 border-cyan-100',
  };
  return (
    <div className="p-6 rounded-3xl border border-slate-200/60 bg-white hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1 hover:border-slate-300 transition-all duration-300 group">
      <div className={cn("w-11 h-11 rounded-2xl flex items-center justify-center border mb-5 shadow-sm transition-all", colors[color])}>
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-lg font-black text-slate-900 mb-2">{title}</h3>
      <p className="text-sm text-slate-500 font-medium leading-relaxed">{desc}</p>
    </div>
  );
}
