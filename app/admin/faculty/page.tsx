import React from 'react';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Button, SwissHeading, SwissSubHeading, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/SwissUI';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FacultyGroupManager from './FacultyGroupManager';

export const dynamic = 'force-dynamic';

export default async function FacultyPage() {
    const result = await getAllFacultyGroups();
    const groups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <DashboardLayout role="HOD">

            {/* Page Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between md:items-end border-b border-border pb-6 gap-4">
                <div>
                    <SwissSubHeading className="mb-2 text-primary">Administration Portal</SwissSubHeading>
                    <SwissHeading>Faculty Groups</SwissHeading>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage department-level faculty groups, assign subjects, and configure timetables.
                    </p>
                </div>
                <Link href="/admin/faculty/new">
                    <Button className="gap-2 shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                        <Plus className="w-4 h-4" /> Create New Group
                    </Button>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto">
                <FacultyGroupManager initialGroups={groups} />
            </div>
        </DashboardLayout>
    );
}
