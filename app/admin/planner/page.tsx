import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PlannerInterface from './PlannerInterface';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';

export const dynamic = 'force-dynamic';

export default async function SmartPlannerPage() {
    // Fetch faculty groups for the selector
    const result = await getAllFacultyGroups();
    const facultyGroups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (        <DashboardLayout role="Admin">
            <div className="max-w-7xl mx-auto mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
                <div className="space-y-1.5">
                    <h1 className="text-3xl font-black text-foreground tracking-tight">Academic Planner</h1>
                    <p className="text-muted-foreground text-sm max-w-2xl font-medium">
                        Create and manage teaching schedules. Select a faculty group and subject to generate or view the teaching schedule.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <PlannerInterface facultyGroups={JSON.parse(JSON.stringify(facultyGroups))} />
            </div>
        </DashboardLayout>
    );
}
