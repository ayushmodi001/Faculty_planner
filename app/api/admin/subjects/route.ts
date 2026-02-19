import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Subject from '@/models/Subject';
import { z } from 'zod';

const subjectSchema = z.object({
    name: z.string().min(2),
    code: z.string().min(2),
    faculties: z.array(z.string()).optional()
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
            return NextResponse.json({ error: "Invalid data", details: result.error.errors }, { status: 400 });
        }

        const { name, code, faculties } = result.data;

        // Check duplicate code
        const existing = await Subject.findOne({ code });
        if (existing) {
            return NextResponse.json({ error: "Subject code already exists" }, { status: 400 });
        }

        const newSubject = await Subject.create({ name, code, faculties });
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
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
