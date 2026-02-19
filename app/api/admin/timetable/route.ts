import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';
import { z } from 'zod';

const SlotSchema = z.object({
    startTime: z.string(),
    endTime: z.string(),
    room: z.string().optional(),
    subject: z.string().optional(),
    faculty: z.string().optional(),
    type: z.enum(['Lecture', 'Lab', 'Break', 'Self Study', 'Project']).default('Lecture')
});

const TimetableUpdateSchema = z.object({
    facultyGroupId: z.string(),
    timetable: z.record(z.string(), z.array(SlotSchema))
});

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        const group = await FacultyGroup.findById(id).lean();
        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            timetable: group.timetable
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();
        const validation = TimetableUpdateSchema.safeParse(body);

        if (!validation.success) {
            return NextResponse.json({ error: "Invalid Data", details: validation.error }, { status: 400 });
        }

        const { facultyGroupId, timetable } = validation.data;

        await FacultyGroup.findByIdAndUpdate(facultyGroupId, {
            $set: { timetable: timetable }
        });

        return NextResponse.json({ success: true, message: "Timetable updated" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) {
            return NextResponse.json({ error: "Group ID required" }, { status: 400 });
        }

        // Clear the timetable (set to empty object or structure with empty arrays)
        // We set it to default empty structure for consistency
        const defaults: any = {};
        ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].forEach(d => defaults[d] = []);

        const group = await FacultyGroup.findByIdAndUpdate(id, {
            $set: { timetable: defaults }
        }, { new: true });

        if (!group) {
            return NextResponse.json({ error: "Group not found" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Timetable cleared"
        });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
