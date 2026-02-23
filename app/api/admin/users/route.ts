import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import { hashPassword, verifyJWT } from '@/lib/auth';
import { z } from 'zod';

const userSchema = z.object({
    email: z.string().email(),
    password: z.string().min(6),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    department: z.string().optional(),
    mobile: z.string().optional(),
    facultyType: z.enum(['JUNIOR', 'SENIOR']).optional(),
    facultyGroupName: z.string().optional(),
    facultyGroupId: z.string().optional()
});

const bulkUserSchema = z.array(userSchema);

// Protect route: Only PRINCIPAL and HOD allowed
const allowedRoles = [UserRole.PRINCIPAL, UserRole.HOD, UserRole.ADMIN];

export async function GET(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        await dbConnect();
        const users = await User.find().select('-passwordHash').sort({ createdAt: -1 });
        return NextResponse.json({ success: true, users });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

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
                return NextResponse.json({ error: "Invalid data format", details: (result.error as any).issues || (result.error as any).errors }, { status: 400 });
            }
            usersToCreate = result.data;
        } else {
            const result = userSchema.safeParse(body);
            if (!result.success) {
                return NextResponse.json({ error: "Invalid data format", details: (result.error as any).issues || (result.error as any).errors }, { status: 400 });
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

                // Resolve facultyGroupId if only name was provided
                let computedGroupId = user.facultyGroupId;
                let computedGroupName = user.facultyGroupName;

                if (!computedGroupId && computedGroupName) {
                    const group = await FacultyGroup.findOne({ name: computedGroupName });
                    if (group) {
                        computedGroupId = group._id.toString();
                        computedGroupName = group.name;
                    } else if (user.role === UserRole.STUDENT) {
                        // For students, having a valid group is ideal but we can let it pass or fail.
                        // We will just leave it undefined and they will have no data.
                        computedGroupName = user.facultyGroupName;
                    }
                }

                const newUser = await User.create({
                    ...user,
                    email: normalizedEmail,
                    passwordHash: hashedPassword,
                    isActive: true,
                    department: session.role === UserRole.HOD ? session.department as string : user.department,
                    facultyGroupId: computedGroupId,
                    facultyGroupName: computedGroupName
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
export async function PUT(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const body = await req.json();
        const { _id, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        await dbConnect();

        if (updateData.email) {
            const existing = await User.findOne({ email: updateData.email, _id: { $ne: _id } });
            if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        if (updateData.password) {
            updateData.passwordHash = await hashPassword(updateData.password);
            delete updateData.password;
        }

        if (updateData.facultyGroupName && !updateData.facultyGroupId) {
            const group = await FacultyGroup.findOne({ name: updateData.facultyGroupName });
            if (group) {
                updateData.facultyGroupId = group._id.toString();
                updateData.facultyGroupName = group.name;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(_id, updateData, { new: true });
        return NextResponse.json({ success: true, user: updatedUser });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
        }

        const { searchParams } = new URL(req.url);
        const id = searchParams.get('id');

        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await dbConnect();
        await User.findByIdAndDelete(id);

        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
