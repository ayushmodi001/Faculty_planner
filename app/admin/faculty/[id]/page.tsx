import React from 'react';
import { notFound } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EditFacultyGroupForm from '@/components/EditFacultyGroupForm';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';

export default async function EditFacultyPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    // We can't pass the Mongoose document directly because it contains methods and non-serializable fields
    // We use lean() and then JSON stringify/parse to be safe for Server Component -> Client Component prop passing
    let group = await FacultyGroup.findById(id).lean();

    if (!group) {
        notFound();
    }

    // Serialization
    group = JSON.parse(JSON.stringify(group));

    return (
        <DashboardLayout role="HOD">
            <EditFacultyGroupForm
                groupId={id}
                initialData={{
                    name: group.name,
                    subjects: group.subjects
                }}
            />
        </DashboardLayout>
    );
}
