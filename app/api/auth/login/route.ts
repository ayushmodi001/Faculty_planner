import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { login, comparePassword } from '@/lib/auth';
import { z } from 'zod';

const loginSchema = z.object({
    email: z.string().email(),
    password: z.string().min(1)
});

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password } = loginSchema.parse(body);

        await dbConnect();

        // 1. Find User (explicitly select passwordHash as it is excluded by default)
        // Ensure email is lowercased to match the schema's storage format
        console.log(`[Login Attempt] Email: ${email.toLowerCase()}`);
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');

        if (!user) {
            console.log(`[Login Failed] User not found: ${email.toLowerCase()}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        if (!user.isActive) {
            return NextResponse.json({ error: "Account disabled. Contact Administrator." }, { status: 403 });
        }

        // 2. Verify Password
        const isMatch = await comparePassword(password, user.passwordHash);
        console.log(`[Login Info] User found. Password match: ${isMatch}`);

        if (!isMatch) {
            console.log(`[Login Failed] Password mismatch for user: ${email}`);
            return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
        }

        // 3. Create Session & Update Last Login
        const redirectUrl = await login(user);

        user.lastLogin = new Date();
        await user.save();

        return NextResponse.json({ success: true, redirectUrl });

    } catch (error: any) {
        console.error("Login Check Error:", error);
        return NextResponse.json({ error: error.message || "Authentication failed" }, { status: 500 });
    }
}
