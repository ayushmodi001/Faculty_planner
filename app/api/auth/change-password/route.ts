import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getSession, comparePassword, hashPassword } from '@/lib/auth';
import { z } from 'zod';

const passwordSchema = z.object({
    currentPassword: z.string().min(1),
    newPassword: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

export async function POST(req: NextRequest) {
    try {
        const session = await getSession();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const body = await req.json();
        const validatedData = passwordSchema.parse(body);

        await dbConnect();

        // Find user and explicitly select passwordHash
        const user = await User.findById(session.sub).select('+passwordHash');
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Verify current password
        const isMatch = await comparePassword(validatedData.currentPassword, user.passwordHash);
        if (!isMatch) {
            return NextResponse.json({ error: "Incorrect current password" }, { status: 400 });
        }

        // Hash and save new password
        user.passwordHash = await hashPassword(validatedData.newPassword);
        await user.save();

        return NextResponse.json({ success: true, message: "Password updated successfully" });

    } catch (error: any) {
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: error.issues[0].message }, { status: 400 });
        }
        return NextResponse.json({ error: error.message || "Failed to update password" }, { status: 500 });
    }
}
