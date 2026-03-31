import nodemailer from 'nodemailer';

function getTransporter() {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '587');
  const user = process.env.SMTP_USER || '';
  const pass = process.env.SMTP_PASS || '';

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
}

const FROM = process.env.SMTP_FROM || '"UAPS System" <noreply@uaps.edu>';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

/** Send invite email to a new faculty/HOD with temp credentials */
export async function sendInviteEmail(opts: {
  to: string;
  name: string;
  tempPassword: string;
  role: string;
}) {
  const transporter = getTransporter();
  const loginUrl = `${BASE_URL}/login`;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: 'You have been invited to UAPS',
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:auto">
  <h2 style="color:#2563eb">Welcome to UAPS, ${opts.name}!</h2>
  <p>You have been added as <strong>${opts.role}</strong> on the University Academic Planning System.</p>
  <p>Your temporary login credentials are:</p>
  <table style="border-collapse:collapse;width:100%">
    <tr><td style="padding:8px;font-weight:bold">Email</td><td style="padding:8px">${opts.to}</td></tr>
    <tr style="background:#f1f5f9"><td style="padding:8px;font-weight:bold">Password</td><td style="padding:8px;font-family:monospace">${opts.tempPassword}</td></tr>
  </table>
  <p style="margin-top:16px">
    <a href="${loginUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Login & Set Password →</a>
  </p>
  <p style="color:#94a3b8;font-size:12px;margin-top:24px">You will be required to change your password on first login. Do not share this email.</p>
</div>`,
  });
}

/** Send password reset OTP email */
export async function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  otp: string;
}) {
  const transporter = getTransporter();
  const resetUrl = `${BASE_URL}/reset-password?email=${encodeURIComponent(opts.to)}`;
  await transporter.sendMail({
    from: FROM,
    to: opts.to,
    subject: 'UAPS – Password Reset Code',
    html: `
<div style="font-family:sans-serif;max-width:560px;margin:auto">
  <h2 style="color:#2563eb">Password Reset Request</h2>
  <p>Hi ${opts.name},</p>
  <p>Use the code below to reset your UAPS password. It expires in <strong>15 minutes</strong>.</p>
  <div style="font-size:36px;font-weight:bold;letter-spacing:12px;text-align:center;padding:24px;background:#f1f5f9;border-radius:8px;margin:16px 0">
    ${opts.otp}
  </div>
  <p>
    <a href="${resetUrl}" style="background:#2563eb;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;font-weight:bold">Reset Password →</a>
  </p>
  <p style="color:#94a3b8;font-size:12px;margin-top:24px">If you did not request this, ignore this email. Your password will not change.</p>
</div>`,
  });
}
