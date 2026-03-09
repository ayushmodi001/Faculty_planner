import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PlannerInterface from '@/app/admin/planner/PlannerInterface';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { getSession } from '@/lib/auth';
import { getFacultyGroupsByFaculty } from '@/app/actions/faculty';

export const dynamic = 'force-dynamic';

export default async function FacultyPlannerPage() {
    const session: any = await getSession();
    const result = await getFacultyGroupsByFaculty(session?.sub);
    const facultyGroups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <DashboardLayout role="Faculty">
            <div className="max-w-7xl mx-auto mb-8 animate-in fade-in duration-500">                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Syllabus Tracker</h1>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        Review the automated lesson plan for your assigned subjects. This plan is read-only. Contact your HOD for any adjustments.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <PlannerInterface facultyGroups={JSON.parse(JSON.stringify(facultyGroups))} readOnly={true} />
            </div>
        </DashboardLayout>
    )
}
