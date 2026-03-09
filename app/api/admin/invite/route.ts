import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import Department from '@/models/Department';
import FacultyGroup from '@/models/FacultyGroup';
import CollegeSettings from '@/models/CollegeSettings';
import { hashPassword, verifyJWT } from '@/lib/auth';
import { sendInviteEmail } from '@/lib/email';
import { z } from 'zod';
import { randomBytes } from 'crypto';

const inviteSchema = z.object({
    email: z.string().email(),
    name: z.string().min(2),
    role: z.nativeEnum(UserRole),
    department: z.string().optional(),
    mobile: z.string().optional(),
    facultyType: z.enum(['JUNIOR', 'SENIOR']).optional(),
    facultyGroupName: z.string().optional(), // used only to resolve facultyGroupId
    enrollmentNumber: z.string().optional(),
    employeeId: z.string().optional(),
});

const allowedRoles = [UserRole.PRINCIPAL, UserRole.HOD, UserRole.ADMIN];

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const body = await req.json();
        const result = inviteSchema.safeParse(body);
        if (!result.success) {
            return NextResponse.json({ error: result.error.issues[0]?.message || 'Invalid data' }, { status: 400 });
        }

        const data = result.data;
        const normalizedEmail = data.email.toLowerCase();

        // --- Domain enforcement ---
        const settings = await CollegeSettings.findOne().lean();
        const allowedDomains: string[] = (settings as any)?.allowedEmailDomains || [];
        if (allowedDomains.length > 0) {
            const emailDomain = normalizedEmail.split('@')[1];
            if (!allowedDomains.includes(emailDomain)) {
                return NextResponse.json({
                    error: `Email domain "@${emailDomain}" is not allowed. Permitted: ${allowedDomains.join(', ')}`
                }, { status: 400 });
            }
        }

        // --- Duplicate check ---
        const existing = await User.findOne({ email: normalizedEmail });
        if (existing) {
            return NextResponse.json({ error: 'A user with this email already exists' }, { status: 409 });
        }

        // --- Generate temp password ---
        const tempPassword = randomBytes(5).toString('hex'); // 10-char hex

        // --- Resolve Department ---
        let computedDeptId;
        const deptName = session.role === UserRole.HOD
            ? (session as any).department
            : data.department;
        if (deptName) {
            const dept = await Department.findOne({ name: deptName });
            if (dept) computedDeptId = dept._id;
        }        // --- Resolve Faculty Group ---
        let computedGroupId;
        if (data.facultyGroupName) {
            const group = await FacultyGroup.findOne({ name: data.facultyGroupName });
            if (group) computedGroupId = group._id;
        }

        const newUser = await User.create({
            email: normalizedEmail,
            passwordHash: await hashPassword(tempPassword),
            name: data.name,
            role: data.role,
            department_id: computedDeptId,
            mobile: data.mobile,
            facultyType: data.facultyType,
            facultyGroupId: computedGroupId,
            enrollmentNumber: data.enrollmentNumber || undefined,
            employeeId: data.employeeId || undefined,
            isActive: true,
            mustChangePassword: true,
            isInvitePending: true,
        });

        // Update Department membership
        if (computedDeptId) {
            if (data.role === UserRole.HOD) {
                await Department.findByIdAndUpdate(computedDeptId, { hod_id: newUser._id });
            }
        }

        // Send invite email (non-blocking — don't fail if SMTP is not configured)
        try {
            await sendInviteEmail({
                to: normalizedEmail,
                name: data.name,
                tempPassword,
                role: data.role,
            });
        } catch (emailErr) {
            console.error('[Invite] Email send failed:', emailErr);
            // Still return success but warn
            return NextResponse.json({
                success: true,
                userId: newUser._id,
                warning: 'User created but invite email could not be sent. Check SMTP settings.',
                tempPassword, // Return temp password so admin can share manually
            });
        }

        return NextResponse.json({ success: true, userId: newUser._id });

    } catch (error: any) {
        console.error('[invite]', error);
        return NextResponse.json({ error: error.message || 'Failed to send invite' }, { status: 500 });
    }
}
