import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Department from '@/models/Department';
import { verifyJWT } from '@/lib/auth';

export async function GET() {
    try {
        await dbConnect();
        const departments = await Department.find().sort({ name: 1 }).lean();
        return NextResponse.json(departments);
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();

        // Authorization check - only Principal/Admin should manage departments
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || (session.role !== 'PRINCIPAL' && session.role !== 'ADMIN')) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { name, code } = await req.json();

        if (!name) {
            return NextResponse.json({ error: "Department name is required" }, { status: 400 });
        }

        const createPayload: any = { name };
        if (code && code.trim() !== '') {
            createPayload.code = code.trim();
        }

        const newDept = await Department.create(createPayload);
        return NextResponse.json(newDept, { status: 201 });
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: "Department already exists" }, { status: 400 });
        }
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
