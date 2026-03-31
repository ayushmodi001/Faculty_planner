import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import Department from '@/models/Department';
import User, { UserRole } from '@/models/User';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { verifyJWT } from '@/lib/auth';

const EDIT_ROLES = [UserRole.PRINCIPAL, UserRole.ADMIN, UserRole.HOD];

const subjectSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    department: z.string().optional(),
    faculties: z.array(z.string()).optional(),
    syllabus: z.string().optional(),
    year: z.union([z.string(), z.number()]).optional().transform(v => v ? Number(v) : undefined),
    semester: z.union([z.string(), z.number()]).optional().transform(v => v ? Number(v) : undefined)
});

export async function GET(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;

        await dbConnect();

        const query: any = {};
        // HOD only sees subjects from their own department
        if (session?.role === UserRole.HOD && session.department_id) {
            query.department_id = session.department_id;
        }

        const subjects = await Subject.find(query).sort({ name: 1 });
        return NextResponse.json({ success: true, subjects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !EDIT_ROLES.includes(session.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await req.json();

        const result = subjectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid data", details: (result.error as any).issues || (result.error as any).errors }, { status: 400 });
        }

        const { name, code, faculties, syllabus, department, year, semester } = result.data;

        // Check duplicate code
        const existing = await Subject.findOne({ code });
        if (existing) {
            return NextResponse.json({ error: "Subject code already exists" }, { status: 400 });
        }

        // HOD can only create subjects in their own department
        let mappedDeptId;
        if (session.role === UserRole.HOD) {
            mappedDeptId = session.department_id; // Force their department
        } else if (department) {
            const dept = await Department.findOne({ name: department });
            if (dept) mappedDeptId = dept._id;
        }

        let mappedFacultyIds: import('mongoose').Types.ObjectId[] = [];
        if (faculties && faculties.length > 0) {
            const users = await User.find({ name: { $in: faculties } }).lean();
            mappedFacultyIds = users.map((u: any) => u._id);
        }

        const newSubject = await Subject.create({
            name,
            code,
            faculty_ids: mappedFacultyIds,
            syllabus,
            department_id: mappedDeptId,
            year,
            semester
        });
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true, subject: newSubject });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !EDIT_ROLES.includes(session.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await Subject.findByIdAndDelete(id);
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !EDIT_ROLES.includes(session.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }
        await dbConnect();
        const body = await req.json();

        // Allow partial updates securely
        const result = subjectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid data", details: (result.error as any).issues || (result.error as any).errors }, { status: 400 });
        }

        const { id } = body;
        const { name, code, syllabus, department, year, semester } = result.data;
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        if (code) {
            const existing = await Subject.findOne({ code, _id: { $ne: id } });
            if (existing) {
                return NextResponse.json({ error: "Subject code already exists" }, { status: 400 });
            }
        }

        const updateData: any = {};
        if (name) updateData.name = name;
        if (code) updateData.code = code;
        if (department !== undefined) {
            const dept = await Department.findOne({ name: department });
            if (dept) updateData.department_id = dept._id;
        }
        if (syllabus !== undefined) updateData.syllabus = syllabus;
        if (year !== undefined) updateData.year = year;
        if (semester !== undefined) updateData.semester = semester;

        const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, { new: true });
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true, subject: updatedSubject });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
