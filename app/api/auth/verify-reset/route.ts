import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { hashPassword } from '@/lib/auth';
import bcrypt from 'bcryptjs';

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email, otp, newPassword } = await req.json();

        if (!email || !otp || !newPassword) {
            return NextResponse.json({ error: 'Email, OTP and new password are required' }, { status: 400 });
        }
        if (newPassword.length < 6) {
            return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
        }

        const token = await PasswordResetToken.findOne({
            email: email.toLowerCase(),
            used: false,
            expiresAt: { $gt: new Date() }
        });

        if (!token) {
            return NextResponse.json({ error: 'Invalid or expired code. Please request a new one.' }, { status: 400 });
        }

        const valid = await bcrypt.compare(otp, token.otpHash);
        if (!valid) {
            return NextResponse.json({ error: 'Incorrect code.' }, { status: 400 });
        }

        // Mark token as used
        token.used = true;
        await token.save();

        // Update password
        const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordHash');
        if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

        user.passwordHash = await hashPassword(newPassword);
        user.mustChangePassword = false;
        await user.save();

        return NextResponse.json({ success: true, message: 'Password updated successfully' });
    } catch (error: any) {
        console.error('[verify-reset]', error);
        return NextResponse.json({ error: 'Reset failed' }, { status: 500 });
    }
}
