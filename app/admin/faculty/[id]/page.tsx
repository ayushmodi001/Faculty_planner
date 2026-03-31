import React from 'react';
import { notFound } from 'next/navigation';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import EditFacultyGroupForm from '@/components/EditFacultyGroupForm';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { cookies } from 'next/headers';
import { verifyJWT } from '@/lib/auth';
import { UserRole } from '@/models/User';

export default async function EditFacultyPage({ params }: { params: Promise<{ id: string }> }) {
    await dbConnect();
    const { id } = await params;

    // RBAC: HOD can only edit groups within their own department
    const cookieStore = await cookies();
    const token = cookieStore.get('session')?.value;
    const session = token ? await verifyJWT(token) : null;
    if (!session) redirect('/login');

    // Import models for population
    await import('@/models/Subject');
    await import('@/models/User');

    // Subjects are derived from subjectAssignments (single source of truth)
    const group = await FacultyGroup.findById(id)
        .populate('faculty_ids', 'name email employeeId')
        .populate('subjectAssignments.subject_id', 'name code')
        .populate('subjectAssignments.faculty_id', 'name email')
        .lean() as any;

    if (!group) {
        notFound();
    }

    // HOD can only edit groups within their own department
    if (session.role === UserRole.HOD && session.department_id) {
        if (group.department_id?.toString() !== session.department_id) {
            notFound(); // Silently 404 from HOD perspective
        }
    }

    // Derive unique subjects from subjectAssignments
    const subjectMap = new Map<string, { _id: string; name: string; code: string }>();
    (group.subjectAssignments || []).forEach((a: any) => {
        const s = a.subject_id;
        if (s?._id) {
            const sid = s._id.toString();
            if (!subjectMap.has(sid)) subjectMap.set(sid, { _id: sid, name: s.name ?? '', code: s.code ?? '' });
        }
    });

    // Find students whose facultyGroupId matches this group
    const UserModel = (await import('@/models/User')).default;
    const students = await UserModel.find({ facultyGroupId: id })
        .select('_id name email enrollmentNumber')
        .lean();

    // Build serializable form-friendly shape
    const serialized = JSON.parse(JSON.stringify({
        name: group.name,
        year: group.year || 1,
        semester: group.semester || 1,
        section: group.section || '',
        subjects: Array.from(subjectMap.values()),
        members: (group.faculty_ids || []).map((f: any) =>
            typeof f === 'object' ? { _id: f._id?.toString(), name: f.name, email: f.email ?? '', employeeId: f.employeeId ?? '' } : { _id: '', name: f, email: '' }
        ),
        students: students.map((s: any) => s._id.toString()),
        subjectAssignments: (group.subjectAssignments || []).map((a: any) => ({
            subject_id: (a.subject_id?._id ?? a.subject_id)?.toString() ?? '',
            subject_name: a.subject_id?.name ?? '',
            subject_code: a.subject_id?.code ?? '',
            faculty_id: (a.faculty_id?._id ?? a.faculty_id)?.toString() ?? '',
            faculty_name: a.faculty_id?.name ?? '',
        })),
        termStartDate: group.termStartDate,
        termEndDate: group.termEndDate,
    }));return (
        <DashboardLayout role="Admin">
            <EditFacultyGroupForm
                groupId={id}
                initialData={serialized}
            />
        </DashboardLayout>
    );
}
