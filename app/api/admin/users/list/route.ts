import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { verifyJWT } from '@/lib/auth';

export async function GET(req: NextRequest) {
    try {
        await dbConnect();
        const { searchParams } = new URL(req.url);
        const role = searchParams.get('role');

        // Verify session and apply department scoping for HOD
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;

        const query: any = { isActive: true };
        if (role) {
            query.role = role.toUpperCase();
        }

        // HOD can only see users in their own department
        if (session?.role === UserRole.HOD && session.department_id) {
            query.department_id = session.department_id;
        }

        const rawUsers = await User.find(query)
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
