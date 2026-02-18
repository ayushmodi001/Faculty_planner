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

    return (
        <DashboardLayout role="HOD">
            <div className="max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="text-primary mb-1">Schedule Manager</SwissSubHeading>
                <SwissHeading>Semester Timetables</SwissHeading>
                <p className="text-muted-foreground mt-2 text-sm max-w-2xl">
                    Define the weekly master schedule for each Faculty Group / Section. This timetable is used by the AI Planner to calculate available teaching slots.
                </p>
            </div>

            <div className="max-w-7xl mx-auto animate-in fade-in duration-700 delay-100">
                <TimetableEditor facultyGroups={JSON.parse(JSON.stringify(facultyGroups))} />
            </div>
        </DashboardLayout>
    );
}
