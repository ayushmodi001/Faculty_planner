'use client';

import { LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function LogoutButton() {
    return (
        <button
            className="flex items-center gap-2 px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200/60 hover:border-rose-200 transition-all active:scale-95 group"
            onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
            }}
            title="Terminate Session"
        >
            <span className="hidden sm:inline text-[9px]">Sign Out</span>
            <LogOut className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </button>
    );
}
