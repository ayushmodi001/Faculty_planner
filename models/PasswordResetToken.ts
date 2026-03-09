import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IPasswordResetToken extends Document {
    email: string;
    otpHash: string;      // bcrypt hash of the 6-digit OTP
    expiresAt: Date;
    used: boolean;
}

const PasswordResetTokenSchema = new Schema<IPasswordResetToken>({
    email:     { type: String, required: true, lowercase: true, trim: true },
    otpHash:   { type: String, required: true },
    expiresAt: { type: Date,   required: true },
    used:      { type: Boolean, default: false },
}, { timestamps: true });

// Auto-delete expired tokens
PasswordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
PasswordResetTokenSchema.index({ email: 1 });

export default models.PasswordResetToken ||
    model<IPasswordResetToken>('PasswordResetToken', PasswordResetTokenSchema);
