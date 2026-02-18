import Link from 'next/link';
import { NeoCard, NeoButton } from '@/components/ui/NeoBrutalism';
import { Calendar, Users, LayoutDashboard, ArrowRight } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-100 bg-dots-pattern flex flex-col items-center justify-center p-8 font-sans text-black">

      {/* Hero Section */}
      <div className="max-w-4xl w-full text-center mb-16 relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-purple-300 rounded-full blur-[100px] opacity-50 z-0"></div>
        <div className="relative z-10">
          <h1 className="text-7xl font-black tracking-tighter hover:tracking-wide transition-all duration-300 mb-4 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 drop-shadow-[5px_5px_0px_rgba(0,0,0,1)]">
            UAPS
          </h1>
          <p className="text-2xl font-bold bg-yellow-300 inline-block px-4 py-1 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg]">
            University Academic Planning System
          </p>
          <p className="mt-6 text-lg text-gray-700 font-medium max-w-2xl mx-auto">
            The next-generation scheduler combining
            <span className="bg-blue-200 px-1 mx-1 border border-black">Smart AI Reasoning</span>
            with
            <span className="bg-pink-200 px-1 mx-1 border border-black">Deterministic Logic</span>.
          </p>
        </div>
      </div>

      {/* Navigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full">

        {/* Admin Module Card */}
        <NeoCard className="bg-white hover:bg-blue-50 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-blue-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-blue-300 transition-colors">
              <Users className="w-8 h-8 text-black" />
            </div>
            <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1 uppercase">Admin Access</span>
          </div>

          <h2 className="text-3xl font-black mb-3 uppercase">HOD Dashboard</h2>
          <p className="text-gray-600 mb-8 font-medium border-l-4 border-black pl-3">
            Manage Faculty Groups, assign subjects, and oversee departmental timetables.
          </p>

          <Link href="/admin/faculty" className="block">
            <NeoButton className="w-full flex justify-between items-center group-hover:translate-x-1 transition-transform">
              <span>Enter Dashboard</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NeoButton>
          </Link>
        </NeoCard>

        {/* Calendar Module Card */}
        <NeoCard className="bg-white hover:bg-purple-50 transition-colors group">
          <div className="flex justify-between items-start mb-6">
            <div className="p-4 bg-purple-100 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] group-hover:bg-purple-300 transition-colors">
              <Calendar className="w-8 h-8 text-black" />
            </div>
            <span className="font-mono text-xs font-bold bg-black text-white px-2 py-1 uppercase">Global Config</span>
          </div>

          <h2 className="text-3xl font-black mb-3 uppercase">Academic Calendar</h2>
          <p className="text-gray-600 mb-8 font-medium border-l-4 border-black pl-3">
            Configure holidays, working Saturdays, and semester timelines for the AI engine.
          </p>

          <Link href="/admin/calendar" className="block">
            <NeoButton variant="secondary" className="w-full flex justify-between items-center group-hover:translate-x-1 transition-transform">
              <span>Manage Calendar</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </NeoButton>
          </Link>
        </NeoCard>

      </div>

      <footer className="mt-16 text-center">
        <p className="text-gray-500 font-mono text-sm">
          System Status: <span className="text-green-600 font-bold">● Online</span> | v0.1.0-alpha
        </p>
      </footer>
    </div>
  );
}
