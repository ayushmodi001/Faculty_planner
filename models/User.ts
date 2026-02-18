import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    PRINCIPAL = 'PRINCIPAL',
    HOD = 'HOD',
    FACULTY = 'FACULTY',
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN' // Super admin (Institute level)
}

export interface IUser extends Document {
    email: string; // Used as User ID/Username
    passwordHash: string;
    role: UserRole;
    name: string;
    department?: string; // Optional (HOD/Faculty specific)
    mobile?: string;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: {
        type: String,
        required: [true, 'Email/User ID is required'],
        unique: true,
        trim: true,
        lowercase: true,
        index: true
    },
    passwordHash: {
        type: String,
        required: [true, 'Password is required'],
        select: false // Never return password by default
    },
    role: {
        type: String,
        enum: Object.values(UserRole),
        required: true,
        default: UserRole.STUDENT
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    department: {
        type: String,
        required: false,
        trim: true
    },
    mobile: {
        type: String,
        required: false,
        trim: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    lastLogin: {
        type: Date
    }
}, {
    timestamps: true
});

// Ensure only one model exists to prevent overwrite errors in dev
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);

export default User;
