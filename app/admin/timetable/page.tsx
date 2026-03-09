import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import TimetableEditor from './TimetableEditor';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';

export const dynamic = 'force-dynamic';

export default async function TimetableManagementPage() {
    // Fetch faculty groups for the selector
    const result = await getAllFacultyGroups();
    const facultyGroups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (        <DashboardLayout role="Admin">
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Semester Timetables</h1>
                        <p className="text-slate-500 text-sm mt-1">Define the weekly master schedule for each Faculty Group.</p>
                    </div>
                </div>

                <div className="animate-in fade-in duration-700 delay-100">
                    <TimetableEditor facultyGroups={JSON.parse(JSON.stringify(facultyGroups))} />
                </div>
            </div>
        </DashboardLayout>
    );
}
