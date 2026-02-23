import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import FacultyGroup from '@/models/FacultyGroup';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const groups = await FacultyGroup.find({}).sort({ name: 1 }).select('name').lean();
        return NextResponse.json({ success: true, groups });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
