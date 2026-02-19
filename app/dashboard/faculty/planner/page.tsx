
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import PlannerInterface from '@/app/admin/planner/PlannerInterface';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';

export const dynamic = 'force-dynamic';

export default async function FacultyPlannerPage() {
    const result = await getAllFacultyGroups();
    const facultyGroups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <DashboardLayout role="Faculty">
            <div className="max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="text-[#5C6836] mb-1">Academic Plan Viewer</SwissSubHeading>
                <SwissHeading className="text-4xl text-[#283618]">Syllabus Roadmap</SwissHeading>
                <p className="text-[#A6835B] mt-2 text-sm max-w-2xl font-medium">
                    Review the AI-generated topic progression. This plan is read-only. Contact your HOD for adjustments.
                </p>
            </div>

            <div className="max-w-7xl mx-auto animate-in fade-in duration-700 delay-100">
                <PlannerInterface facultyGroups={JSON.parse(JSON.stringify(facultyGroups))} readOnly={true} />
            </div>
        </DashboardLayout>
    )
}
