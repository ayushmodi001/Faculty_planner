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
        }

        const users = await User.find(query).select('name email role department').lean();

        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
