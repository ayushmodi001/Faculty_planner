import React from 'react';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import FacultyGroupList from '@/components/FacultyGroupList';
import { IFacultyGroup } from '@/models/FacultyGroup';

export const dynamic = 'force-dynamic';

export default async function FacultyPage() {
    const result = await getAllFacultyGroups();
    const groups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <div className="min-h-screen p-8 bg-zinc-50 text-black font-sans">
            <header className="max-w-7xl mx-auto mb-12 border-b-4 border-black pb-6">
                <h1 className="text-6xl font-black uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    Faculty Command Center
                </h1>
                <p className="text-xl font-bold mt-2 font-mono bg-yellow-300 inline-block px-2 rotate-1 border-2 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                    HOD: Manage Schedules & Groups
                </p>
            </header>

            <main className="max-w-7xl mx-auto">
                <FacultyGroupList groups={groups} />
            </main>
        </div>
    );
}
