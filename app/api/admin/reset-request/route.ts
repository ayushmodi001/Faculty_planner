import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User, { UserRole } from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/email';
import { verifyJWT } from '@/lib/auth';
import bcrypt from 'bcryptjs';

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

const allowedRoles = [UserRole.PRINCIPAL, UserRole.HOD, UserRole.ADMIN];

export async function POST(req: NextRequest) {
    try {
        const cookie = req.cookies.get('session')?.value;
        const session = cookie ? await verifyJWT(cookie) : null;
        if (!session || !allowedRoles.includes(session.role as UserRole)) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
        }

        await dbConnect();
        const { userId } = await req.json();
        if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

        const user = await User.findById(userId);
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await PasswordResetToken.deleteMany({ email: user.email });
        await PasswordResetToken.create({ email: user.email, otpHash, expiresAt });

        try {
            await sendPasswordResetEmail({ to: user.email, name: user.name, otp });
        } catch (emailErr) {
            console.error('[admin reset-request] Email failed:', emailErr);
            return NextResponse.json({
                success: true,
                warning: 'Reset token created but email could not be sent. Check SMTP settings.',
            });
        }

        return NextResponse.json({ success: true, message: `Reset email sent to ${user.email}` });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
