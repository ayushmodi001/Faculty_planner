import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import PasswordResetToken from '@/models/PasswordResetToken';
import { sendPasswordResetEmail } from '@/lib/email';
import bcrypt from 'bcryptjs';

function generateOtp() {
    return String(Math.floor(100000 + Math.random() * 900000));
}

export async function POST(req: NextRequest) {
    try {
        await dbConnect();
        const { email } = await req.json();
        if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });

        const user = await User.findOne({ email: email.toLowerCase() });
        // Always return 200 to prevent email enumeration
        if (!user) return NextResponse.json({ success: true });

        const otp = generateOtp();
        const otpHash = await bcrypt.hash(otp, 10);
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

        // Invalidate old tokens for this email
        await PasswordResetToken.deleteMany({ email: user.email });

        await PasswordResetToken.create({ email: user.email, otpHash, expiresAt });

        await sendPasswordResetEmail({ to: user.email, name: user.name, otp });

        return NextResponse.json({ success: true });
    } catch (error: any) {
        console.error('[request-reset]', error);
        return NextResponse.json({ error: 'Failed to send reset email' }, { status: 500 });
    }
}
