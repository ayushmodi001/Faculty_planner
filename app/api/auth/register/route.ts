import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { hashPassword } from '@/lib/auth';
import { z } from 'zod';

const registerSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.enum([UserRole.PRINCIPAL, UserRole.HOD, UserRole.FACULTY, UserRole.STUDENT, UserRole.ADMIN]),
    secretKey: z.string()
});

const SETUP_SECRET = process.env.SETUP_SECRET || 'UAPS_ADMIN_SETUP_2026';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { email, password, name, role, secretKey } = registerSchema.parse(body);

        // Security Check: Verify Setup Key
        if (secretKey !== SETUP_SECRET) {
            return NextResponse.json({ error: "Unauthorized: Invalid Setup Key" }, { status: 403 });
        }

        await dbConnect();

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return NextResponse.json({ error: "User already exists" }, { status: 400 });
        }

        // Create User
        const hashedPassword = await hashPassword(password);

        await User.create({
            email,
            passwordHash: hashedPassword,
            name,
            role,
            isActive: true
        });

        return NextResponse.json({ success: true, message: "User created successfully" });

    } catch (error: any) {
        console.error("Registration Error:", error);
        return NextResponse.json({ error: error.message || "Registration failed" }, { status: 500 });
    }
}
