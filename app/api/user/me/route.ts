import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/auth';
import dbConnect from '@/lib/db';

export async function GET(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Resolve department name for display (HOD needs this in the nav)
        let departmentName: string | undefined;
        if (session.department_id) {
            await dbConnect();
            const Department = (await import('@/models/Department')).default;
            const dept = await Department.findById(session.department_id).select('name').lean() as any;
            if (dept) departmentName = dept.name;
        }

        return NextResponse.json({
            success: true,
            user: {
                sub: session.sub,
                email: session.email,
                name: session.name,
                role: session.role,
                department_id: session.department_id ?? null,
                department: departmentName ?? null,   // <– human-readable name for UI
                facultyGroupId: session.facultyGroupId ?? null,
                facultyGroupIds: Array.isArray(session.facultyGroupIds) ? session.facultyGroupIds : [],
                facultyType: session.facultyType ?? null,
                mustChangePassword: session.mustChangePassword ?? false,
            },
        });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
