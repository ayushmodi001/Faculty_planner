import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    // Single Item Get if ID provided
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (id) {
            const group = await FacultyGroup.findById(id);
            return NextResponse.json({ success: true, group });
        }
        return NextResponse.json({ error: "ID required" }, { status: 400 });
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
        console.log("PUT /api/admin/faculty/groups Body:", body);

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        let updateData: any = {
            name: body.name,
            subjects: body.subjects,
            members: body.members,
            termStartDate: body.termStartDate,
            termEndDate: body.termEndDate
        };
        if (body.students !== undefined) updateData.students = body.students;

        const updated = await FacultyGroup.findByIdAndUpdate(id, updateData, { new: true });

        if (body.students !== undefined) {
            const User = (await import('@/models/User')).default;

            // First clear any user that previously had this facultyGroupId but is not in students array
            await User.updateMany(
                { facultyGroupId: id, _id: { $nin: body.students } },
                { $unset: { facultyGroupId: "", facultyGroupName: "" } }
            );

            // Set facultyGroupId for all current students
            if (body.students.length > 0) {
                await User.updateMany(
                    { _id: { $in: body.students } },
                    { $set: { facultyGroupId: updated._id.toString(), facultyGroupName: updated.name } }
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

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await FacultyGroup.findByIdAndDelete(id);
        revalidatePath('/admin/faculty');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
