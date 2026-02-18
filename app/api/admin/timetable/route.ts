import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';

const SlotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
    room: z.string().optional(),
    subject: z.string().optional(),
    type: z.enum(['Lecture', 'Lab', 'Break']).default('Lecture')
});

const TimetableUpdateSchema = z.object({
    facultyGroupId: z.string(),
    timetable: z.record(z.string(), z.array(SlotSchema))
});

export async function GET(req: NextRequest) {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const facultyGroupId = searchParams.get('id');

    if (!facultyGroupId) {
        return NextResponse.json({ error: 'Group ID required' }, { status: 400 });
    }

    const group = await FacultyGroup.findById(facultyGroupId).lean();
    if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    return NextResponse.json({
        success: true,
        timetable: group.timetable || {}
    });
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        const { facultyGroupId, timetable } = TimetableUpdateSchema.parse(body);

        const group = await FacultyGroup.findByIdAndUpdate(
            facultyGroupId,
            { $set: { timetable: timetable } },
            { new: true }
        );

        if (!group) {
            return NextResponse.json({ error: 'Group not found' }, { status: 404 });
        }

        return NextResponse.json({ success: true, group });

    } catch (error: any) {
        console.error("Timetable Update Error:", error);
        return NextResponse.json(
            { error: error.message || "Internal Server Error" },
            { status: 500 }
        );
    }
}
