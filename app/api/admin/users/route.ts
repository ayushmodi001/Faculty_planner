import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import { hashPassword, verifyJWT } from '@/lib/auth';
import { z } from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    department: z.string().optional(),
    mobile: z.string().optional()
});

const bulkUserSchema = z.array(userSchema);

// Protect route: Only PRINCIPAL and HOD allowed
const allowedRoles = [UserRole.PRINCIPAL, UserRole.HOD, UserRole.ADMIN];

export async function POST(req: NextRequest) {
    try {
        // 1. Verify Authentication
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;

        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: "Unauthorized: Insufficient permissions" }, { status: 403 });
        }

        const body = await req.json();
        await dbConnect();

        // 2. Determine Single vs Bulk
        const isBulk = Array.isArray(body);
        let usersToCreate = [];

        if (isBulk) {
            const result = bulkUserSchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json({ error: "Invalid data format", details: result.error.errors }, { status: 400 });
            }
            usersToCreate = result.data;
        } else {
            const result = userSchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json({ error: "Invalid data format", details: result.error.errors }, { status: 400 });
            }
            usersToCreate = [result.data];
        }

        // 3. Process & Create Users
        const createdUsers = [];
        const errors = [];

        for (const user of usersToCreate) {
            try {
                const normalizedEmail = user.email.toLowerCase();

                // Check duplicate
                const existing = await User.findOne({ email: normalizedEmail });
                if (existing) {
                    errors.push({ email: user.email, error: "User already exists" });
                    continue;
                }

                // Hash Password
                const hashedPassword = await hashPassword(user.password);

                const newUser = await User.create({
                    ...user,
                    email: normalizedEmail,
                    passwordHash: hashedPassword,
                    isActive: true,
                    department: session.role === UserRole.HOD ? session.department : user.department // If HOD, force dept? optional logic
                });

                createdUsers.push({ email: newUser.email, id: newUser._id });
            } catch (err: any) {
                errors.push({ email: user.email, error: err.message });
            }
        }

        return NextResponse.json({
            success: true,
            createdCount: createdUsers.length,
            errorCount: errors.length,
            errors: errors.length > 0 ? errors : undefined
        });

    } catch (error: any) {
        console.error("User Creation Error:", error);
        return NextResponse.json({ error: error.message || "Operation failed" }, { status: 500 });
    }
}
