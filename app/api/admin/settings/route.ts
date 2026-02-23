import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CollegeSettings from '@/models/CollegeSettings';
import { revalidatePath } from 'next/cache';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        let settings = await CollegeSettings.findOne();
        if (!settings) {
            settings = await CollegeSettings.create({
                collegeStartTime: "09:00",
                collegeEndTime: "16:00",
                slotDurationHours: 1
            });
        }
        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        await dbConnect();
        const body = await req.json();

        // Find existing or create
        let settings = await CollegeSettings.findOne();
        if (settings) {
            settings.collegeStartTime = body.collegeStartTime || settings.collegeStartTime;
            settings.collegeEndTime = body.collegeEndTime || settings.collegeEndTime;
            settings.slotDurationHours = body.slotDurationHours || settings.slotDurationHours;
            await settings.save();
        } else {
            settings = await CollegeSettings.create({
                collegeStartTime: body.collegeStartTime || "09:00",
                collegeEndTime: body.collegeEndTime || "16:00",
                slotDurationHours: body.slotDurationHours || 1
            });
        }

        revalidatePath('/dashboard/principal/settings');
        revalidatePath('/admin/timetable');
        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
