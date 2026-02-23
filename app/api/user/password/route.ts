import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession, hashPassword, comparePassword } from '@/lib/auth';

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const { currentPassword, newPassword } = body;

        if (!currentPassword || !newPassword) {
            return NextResponse.json({ error: "Current and new password are required" }, { status: 400 });
        }

        await dbConnect();

        const userId = session.sub;
        const user = await User.findById(userId).select('+passwordHash');
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const isMatch = await comparePassword(currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        user.passwordHash = await hashPassword(newPassword);
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
    }
}
