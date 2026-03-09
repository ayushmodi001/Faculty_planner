import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');        if (id) {
            const group = await FacultyGroup.findById(id)
                .populate('faculty_ids', 'name email employeeId')
                .populate('subjectAssignments.subject_id', 'name code')
                .populate('subjectAssignments.faculty_id', 'name email')
                .lean();
            if (!group) return NextResponse.json({ error: 'Not found' }, { status: 404 });
            // Flatten for UI consumption — subjects derived from subjectAssignments
            const seenSubjects = new Map<string, any>();
            (group.subjectAssignments as any[])?.forEach((a: any) => {
                const sid = a.subject_id?._id?.toString() ?? a.subject_id?.toString();
                if (sid && !seenSubjects.has(sid)) {
                    seenSubjects.set(sid, { _id: sid, name: a.subject_id?.name ?? '', code: a.subject_id?.code ?? '' });
                }
            });
            const mapped = {
                ...group,
                subjects: Array.from(seenSubjects.values()),
                members: (group.faculty_ids as any[])?.map((f: any) => ({ _id: f._id, name: f.name, email: f.email, employeeId: f.employeeId })) || [],
                subjectAssignments: (group.subjectAssignments as any[])?.map((a: any) => ({
                    subject_id: a.subject_id?._id ?? a.subject_id,
                    subject_name: a.subject_id?.name ?? '',
                    subject_code: a.subject_id?.code ?? '',
                    faculty_id: a.faculty_id?._id ?? a.faculty_id,
                    faculty_name: a.faculty_id?.name ?? '',
                })) || [],
            };
            return NextResponse.json({ success: true, group: mapped });
        }
        return NextResponse.json({ error: 'ID required' }, { status: 400 });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const body = await req.json();
        console.log('PUT /api/admin/faculty/groups Body:', body);

        if (!id) return NextResponse.json({ error: 'ID required' }, { status: 400 });        const UserModel = (await import('@/models/User')).default;

        const updateData: Record<string, any> = {};

        if (body.name !== undefined) updateData.name = body.name;
        if (body.termStartDate !== undefined) updateData.termStartDate = body.termStartDate || null;
        if (body.termEndDate !== undefined) updateData.termEndDate = body.termEndDate || null;
        if (body.year !== undefined) updateData.year = body.year;
        if (body.semester !== undefined) updateData.semester = body.semester;
        if (body.section !== undefined) updateData.section = body.section?.toUpperCase() || undefined;

        // Resolve faculty names → ObjectIds
        if (Array.isArray(body.members)) {
            const foundFaculty = await UserModel.find({ name: { $in: body.members } }).lean();
            updateData.faculty_ids = foundFaculty.map((f: any) => f._id);
        }

        // Save subject → faculty assignments (already use ObjectId strings from client)
        // subjectAssignments is the single source of truth for subject membership
        if (Array.isArray(body.subjectAssignments)) {
            updateData.subjectAssignments = body.subjectAssignments
                .filter((a: any) => a.subject_id && a.faculty_id)
                .map((a: any) => ({ subject_id: a.subject_id, faculty_id: a.faculty_id }));
        }

        const updated = await FacultyGroup.findByIdAndUpdate(id, updateData, { new: true });
        if (!updated) return NextResponse.json({ error: 'Faculty Group not found' }, { status: 404 });

        // Handle student assignment: update User.facultyGroupId (ObjectId) only
        if (Array.isArray(body.students)) {
            // Clear old associations for students no longer in group
            await UserModel.updateMany(
                { facultyGroupId: updated._id, _id: { $nin: body.students } },
                { $unset: { facultyGroupId: '' } }
            );

            if (body.students.length > 0) {
                await UserModel.updateMany(
                    { _id: { $in: body.students } },
                    { $set: { facultyGroupId: updated._id } }
                );
            }
        }

        revalidatePath('/admin/faculty');
        return NextResponse.json({ success: true, group: updated });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        const ids = searchParams.get('ids');

        if (ids) {
            const idArray = ids.split(',').filter(Boolean);
            await FacultyGroup.deleteMany({ _id: { $in: idArray } });
            revalidatePath('/admin/faculty');
            return NextResponse.json({ success: true, count: idArray.length });
        }

        if (!id) return NextResponse.json({ error: 'ID or IDs required' }, { status: 400 });

        await FacultyGroup.findByIdAndDelete(id);
        revalidatePath('/admin/faculty');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
