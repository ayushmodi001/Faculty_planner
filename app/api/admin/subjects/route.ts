import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { z } from 'zod';
import { revalidatePath } from 'next/cache';

const subjectSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    faculties: z.array(z.string()).optional(),
    syllabus: z.string().optional()
});

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const subjects = await Subject.find({}).sort({ name: 1 });
        return NextResponse.json({ success: true, subjects });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const result = subjectSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: "Invalid data", details: (result.error as any).issues || (result.error as any).errors }, { status: 400 });
        }

        const { name, code, faculties, syllabus } = result.data;

        // Check duplicate code
        const existing = await Subject.findOne({ code });
        if (existing) {
            return NextResponse.json({ error: "Subject code already exists" }, { status: 400 });
        }

        const newSubject = await Subject.create({ name, code, faculties, syllabus });
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true, subject: newSubject });

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

        await Subject.findByIdAndDelete(id);
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Allow partial updates securely
        const { id, name, code, syllabus } = body;
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
        if (syllabus !== undefined) updateData.syllabus = syllabus;

        const updatedSubject = await Subject.findByIdAndUpdate(id, updateData, { new: true });
        revalidatePath('/admin/subjects');
        return NextResponse.json({ success: true, subject: updatedSubject });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
