import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';

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

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const updated = await FacultyGroup.findByIdAndUpdate(id, {
            name: body.name,
            subjects: body.subjects,
            members: body.members
        }, { new: true });

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
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
