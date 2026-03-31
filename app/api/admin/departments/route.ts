import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';
import FacultyGroup from '@/models/FacultyGroup';
import { verifyJWT } from '@/lib/auth';

const isAdmin = (role: string) => role === 'PRINCIPAL' || role === 'ADMIN';

export async function GET() {
    try {
        await dbConnect();
        const departments = await Department.find()
            .populate('hod_id', 'name email')
            .sort({ name: 1 }).lean();
        return NextResponse.json(departments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !isAdmin(session.role as string)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, code } = await req.json();
        if (!name) return NextResponse.json({ error: "Department name is required" }, { status: 400 });

        const createPayload: any = { name };
        if (code && code.trim() !== '') createPayload.code = code.trim().toUpperCase();

        const newDept = await Department.create(createPayload);
        return NextResponse.json(newDept, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Department already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !isAdmin(session.role as string)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { id, name, code } = await req.json();
        if (!id) return NextResponse.json({ error: "Department ID required" }, { status: 400 });
        if (!name) return NextResponse.json({ error: "Name is required" }, { status: 400 });

        const updateData: any = { name };
        if (code !== undefined) updateData.code = code ? code.trim().toUpperCase() : undefined;

        const updated = await Department.findByIdAndUpdate(
            id,
            { $set: updateData },
            { new: true, runValidators: true }
        ).lean();

        if (!updated) return NextResponse.json({ error: "Department not found" }, { status: 404 });
        return NextResponse.json(updated);
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Department name or code already in use" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !isAdmin(session.role as string)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "Department ID required" }, { status: 400 });

        // Guard: prevent deleting a department that still has faculty groups
        const groupCount = await FacultyGroup.countDocuments({ department_id: id });
        if (groupCount > 0) {
            return NextResponse.json({
                error: `Cannot delete: ${groupCount} faculty group(s) are linked to this department. Reassign them first.`
            }, { status: 409 });
        }

        const deleted = await Department.findByIdAndDelete(id);
        if (!deleted) return NextResponse.json({ error: "Department not found" }, { status: 404 });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
