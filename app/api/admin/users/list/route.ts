import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        const query: any = { isActive: true };
        if (role) {
            query.role = role.toUpperCase();
        }        const rawUsers = await User.find(query)
            .populate('department_id', 'name')
            .select('name email role department_id enrollmentNumber employeeId')
            .lean();

        const users = rawUsers.map((u: any) => ({
            ...u,
            department: u.department_id ? u.department_id.name : undefined
        }));

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
