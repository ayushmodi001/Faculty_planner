import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import CollegeSettings from '@/models/CollegeSettings';
import { revalidatePath } from 'next/cache';
import { verifyJWT } from '@/lib/auth';
import { UserRole } from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        let settings = await CollegeSettings.findOne();
        if (!settings) {
            settings = await CollegeSettings.create({
                collegeStartTime: "09:00",
                collegeEndTime: "16:00",
                slotDurationHours: 1,
                labDurationHours: 2,
                breakStartTime: "13:00",
                breakDurationHours: 1
            });
        }
        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function PUT(req: NextRequest) {
    try {
        // Only PRINCIPAL and ADMIN can edit college settings; HODs are blocked
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        if (session.role !== UserRole.PRINCIPAL && session.role !== UserRole.ADMIN) {
            return NextResponse.json({ error: 'Only Principal or Admin can edit college settings' }, { status: 403 });
        }
        await dbConnect();
        const body = await req.json();

        // Find existing or create
        let settings = await CollegeSettings.findOne();
        if (settings) {
            settings.collegeStartTime = body.collegeStartTime || settings.collegeStartTime;
            settings.collegeEndTime = body.collegeEndTime || settings.collegeEndTime;
            settings.slotDurationHours = body.slotDurationHours !== undefined ? body.slotDurationHours : settings.slotDurationHours;
            settings.labDurationHours = body.labDurationHours !== undefined ? body.labDurationHours : settings.labDurationHours;
            settings.breakStartTime = body.breakStartTime || settings.breakStartTime;
            settings.breakDurationHours = body.breakDurationHours !== undefined ? body.breakDurationHours : settings.breakDurationHours;
            settings.institutionName = body.institutionName || settings.institutionName;
            settings.institutionShortName = body.institutionShortName || settings.institutionShortName;            settings.contactEmail = body.contactEmail || settings.contactEmail;
            settings.address = body.address || settings.address;
            if (Array.isArray(body.allowedEmailDomains)) {
                (settings as any).allowedEmailDomains = body.allowedEmailDomains
                    .map((d: string) => d.toLowerCase().trim())
                    .filter(Boolean);
            }
            await settings.save();
        } else {
            settings = await CollegeSettings.create({
                collegeStartTime: body.collegeStartTime || "09:00",
                collegeEndTime: body.collegeEndTime || "16:00",
                slotDurationHours: body.slotDurationHours || 1,
                labDurationHours: body.labDurationHours || 2,
                breakStartTime: body.breakStartTime || "13:00",
                breakDurationHours: body.breakDurationHours || 1,
                institutionName: body.institutionName || "UAPS",
                institutionShortName: body.institutionShortName || "UAPS",
                contactEmail: body.contactEmail,
                address: body.address
            });
        }

        revalidatePath('/dashboard/principal/settings');
        revalidatePath('/admin/timetable');
        return NextResponse.json({ success: true, settings });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
