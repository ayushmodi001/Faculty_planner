import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
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
                if (user && (user as any).facultyGroupId) {
                    defaultGroupId = (user as any).facultyGroupId;
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
            <div className="max-w-7xl mx-auto mb-8 animate-in fade-in duration-500">                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Syllabus Tracker</h1>
                    <p className="text-slate-500 text-sm max-w-2xl">
                        View the scheduled topics for your enrolled subjects and track your academic progress.
                    </p>
                </div>
            </div>

            <div className="max-w-7xl mx-auto">
                <PlannerInterface
                    facultyGroups={JSON.parse(JSON.stringify(facultyGroups))}
                    readOnly={true}
                    defaultGroupId={defaultGroupId}
                />
            </div>
        </DashboardLayout>
    )
}
