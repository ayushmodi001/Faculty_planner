
import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import PlannerInterface from '@/app/admin/planner/PlannerInterface';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import User from '@/models/User';
import dbConnect from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function StudentPlannerPage() {
    let defaultGroupId = "";

    try {
        await dbConnect();
        const cookieStore = await cookies();
        const token = cookieStore.get('session')?.value;
        if (token) {
            const session = await verifyJWT(token);
            if (session) {
                const user = await User.findById(session.id).lean();
                if (user && user.facultyGroupId) {
                    defaultGroupId = user.facultyGroupId;
                }
            }
        }
    } catch (err) {
        console.error("Error fetching student group", err);
    }

    const result = await getAllFacultyGroups();
    const facultyGroups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <DashboardLayout role="Student">
            <div className="max-w-7xl mx-auto mb-8 animate-in slide-in-from-bottom-5 duration-500">
                <SwissSubHeading className="text-[#5C6836] mb-1">Curriculum Tracker</SwissSubHeading>
                <SwissHeading className="text-4xl text-[#283618]">Course Roadmap</SwissHeading>
                <p className="text-[#A6835B] mt-2 text-sm max-w-2xl font-medium">
                    View the scheduled topics for your enrolled subjects.
                </p>
            </div>

            <div className="max-w-7xl mx-auto animate-in fade-in duration-700 delay-100">
                <PlannerInterface
                    facultyGroups={JSON.parse(JSON.stringify(facultyGroups))}
                    readOnly={true}
                    defaultGroupId={defaultGroupId}
                />
            </div>
        </DashboardLayout>
    )
}
