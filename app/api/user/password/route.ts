import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession, hashPassword, comparePassword, login } from '@/lib/auth';

export async function PUT(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }        const body = await req.json();
        const { currentPassword, newPassword, skipCurrentCheck } = body;

        if (!newPassword) {
            return NextResponse.json({ error: "New password is required" }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: "Password must be at least 6 characters" }, { status: 400 });
        }

        await dbConnect();

        const userId = session.sub;
        const user = await User.findById(userId).select('+passwordHash');
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // skipCurrentCheck is only honoured when user has mustChangePassword flag
        if (!skipCurrentCheck || !user.mustChangePassword) {
            if (!currentPassword) {
                return NextResponse.json({ error: "Current password is required" }, { status: 400 });
            }
            const isMatch = await comparePassword(currentPassword, user.passwordHash);
            if (!isMatch) {
                return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
            }
        }        user.passwordHash = await hashPassword(newPassword);
        user.mustChangePassword = false;
        user.isInvitePending = false;
        await user.save();

        // Re-issue session cookie so mustChangePassword flag is cleared in JWT
        await login(user);

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
    }
}
