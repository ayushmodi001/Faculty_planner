import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import FacultyGroup from '@/models/FacultyGroup';
import Department from '@/models/Department';
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
    facultyGroupName: z.string().optional(), // used only to resolve facultyGroupId (Student)
    facultyGroupId: z.string().optional(),
    facultyGroupNames: z.array(z.string()).optional(), // used only to resolve facultyGroupIds (Faculty/HOD)
    facultyGroupIds: z.array(z.string()).optional()
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
        }        await dbConnect();

        // Enforce HOD limitation: can only see users of their own department
        const filter: any = {};
        if (session.role === UserRole.HOD) {
            if (!session.department_id) {
                return NextResponse.json({ error: "HOD has no department assigned" }, { status: 403 });
            }
            filter.department_id = session.department_id;
        }

        const rawUsers = await User.find(filter)
            .populate('department_id', 'name')
            .populate('facultyGroupId', 'name')
            .populate('facultyGroupIds', 'name')
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .lean();
        const users = rawUsers.map((u: any) => ({
            ...u,
            department: u.department_id ? u.department_id.name : undefined,
            facultyGroupName: u.facultyGroupId ? (u.facultyGroupId as any).name : undefined,
            facultyGroupNames: u.facultyGroupIds ? u.facultyGroupIds.map((g: any) => g.name) : undefined,
        }));
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
                const hashedPassword = await hashPassword(user.password);                // Resolve facultyGroupId (single, e.g. Student)
                let computedGroupId = user.facultyGroupId;
                if (!computedGroupId && user.facultyGroupName) {
                    const group = await FacultyGroup.findOne({ name: user.facultyGroupName });
                    if (group) {
                        computedGroupId = group._id.toString();
                    }
                }

                // Resolve facultyGroupIds (array, e.g. Faculty/HOD)
                let computedGroupIds = user.facultyGroupIds || [];
                if (computedGroupIds.length === 0 && user.facultyGroupNames && user.facultyGroupNames.length > 0) {
                    const groups = await FacultyGroup.find({ name: { $in: user.facultyGroupNames } });
                    computedGroupIds = groups.map(g => g._id.toString());
                }

                // Resolve Department string to ObjectId
                let computedDeptId;
                if (session.role === UserRole.HOD) {
                    computedDeptId = session.department_id; // Absolute restriction
                } else if (user.department) {
                    const dept = await Department.findOne({ name: user.department });
                    if (dept) computedDeptId = dept._id;
                }

                const mongooseInstance = (await import('mongoose')).default;
                const newUser = await User.create({
                    ...user,
                    email: normalizedEmail,
                    passwordHash: hashedPassword,
                    isActive: true,
                    department_id: computedDeptId,
                    facultyGroupId: computedGroupId ? new mongooseInstance.Types.ObjectId(computedGroupId) : undefined,
                    facultyGroupIds: computedGroupIds.map(id => new mongooseInstance.Types.ObjectId(id)),
                });

                if (computedDeptId && user.role === UserRole.HOD) {
                    await Department.findByIdAndUpdate(computedDeptId, { hod_id: newUser._id });
                }

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
        }        const body = await req.json();
        // Strip server-only fields; enrollmentNumber / employeeId are kept in updateData
        const { _id, passwordHash, ...updateData } = body;

        if (!_id) return NextResponse.json({ error: "User ID required" }, { status: 400 });

        // Prevent privilege escalation
        if (session.role !== UserRole.ADMIN && session.role !== UserRole.PRINCIPAL) {
            if (updateData.role === UserRole.ADMIN || updateData.role === UserRole.PRINCIPAL) {
                return NextResponse.json({ error: "Unauthorized: Cannot escalate to Admin/Principal" }, { status: 403 });
            }
        }

        await dbConnect();

        // HOD cannot edit PRINCIPAL, HOD, or ADMIN — or users outside their dept
        if (session.role === UserRole.HOD) {
            const targetUser = await User.findById(_id).lean();
            if (!targetUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });
            const targetRole = (targetUser as any).role;
            if (targetRole === UserRole.PRINCIPAL || targetRole === UserRole.HOD || targetRole === UserRole.ADMIN) {
                return NextResponse.json({ error: 'Cannot edit this user' }, { status: 403 });
            }
            if (session.department_id && (targetUser as any).department_id?.toString() !== session.department_id) {
                return NextResponse.json({ error: 'Cannot edit users outside your department' }, { status: 403 });
            }
        }

        if (updateData.email) {
            const existing = await User.findOne({ email: updateData.email, _id: { $ne: _id } });
            if (existing) return NextResponse.json({ error: "Email already in use" }, { status: 400 });
        }

        if (updateData.password) {
            updateData.passwordHash = await hashPassword(updateData.password);
            delete updateData.password;
        }        if (updateData.facultyGroupName && !updateData.facultyGroupId) {
            const group = await FacultyGroup.findOne({ name: updateData.facultyGroupName });
            if (group) updateData.facultyGroupId = group._id;
        }
        delete updateData.facultyGroupName;

        if (updateData.facultyGroupNames && updateData.facultyGroupNames.length > 0 && (!updateData.facultyGroupIds || updateData.facultyGroupIds.length === 0)) {
            const groups = await FacultyGroup.find({ name: { $in: updateData.facultyGroupNames } });
            updateData.facultyGroupIds = groups.map(g => g._id);
        }
        delete updateData.facultyGroupNames;

        if (session.role === UserRole.HOD) {
            updateData.department_id = session.department_id; // Force HOD's department
            delete updateData.department;
        } else if (updateData.department) {
            const dept = await Department.findOne({ name: updateData.department });
            if (dept) {
                updateData.department_id = dept._id;
            }
            delete updateData.department;
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

        // HOD cannot delete PRINCIPAL or another HOD
        const target = await User.findById(id).lean();
        if (!target) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        if (session.role === UserRole.HOD) {
            if (
                (target as any).role === UserRole.PRINCIPAL ||
                (target as any).role === UserRole.HOD ||
                (target as any).role === UserRole.ADMIN
            ) {
                return NextResponse.json({ error: 'Insufficient permissions to delete this user' }, { status: 403 });
            }
            // Also enforce department scope
            if (session.department_id && (target as any).department_id?.toString() !== session.department_id) {
                return NextResponse.json({ error: 'Cannot delete users outside your department' }, { status: 403 });
            }
        }

        await User.findByIdAndDelete(id);
        return NextResponse.json({ success: true });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
