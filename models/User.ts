import mongoose, { Schema, Document, Model } from 'mongoose';

export enum UserRole {
    PRINCIPAL = 'PRINCIPAL',
    HOD = 'HOD',
    FACULTY = 'FACULTY',
    STUDENT = 'STUDENT',
    ADMIN = 'ADMIN'
}

export interface IUser extends Document {
    email: string;
    passwordHash: string;
    role: UserRole;
    name: string;
    department_id?: mongoose.Types.ObjectId;
    mobile?: string;
    facultyType?: 'JUNIOR' | 'SENIOR';
    facultyGroupId?: mongoose.Types.ObjectId;
    enrollmentNumber?: string;
    employeeId?: string;
    mustChangePassword: boolean;
    isInvitePending: boolean;
    isActive: boolean;
    lastLogin?: Date;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema: Schema = new Schema({
    email: { type: String, required: [true, 'Email is required'], unique: true, trim: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: Object.values(UserRole), required: true, default: UserRole.STUDENT },
    name: { type: String, required: true, trim: true },
    department_id: { type: Schema.Types.ObjectId, ref: 'Department' },
    mobile: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    lastLogin: { type: Date },
    facultyType: { type: String, enum: ['JUNIOR', 'SENIOR'] },
    facultyGroupId: { type: Schema.Types.ObjectId, ref: 'FacultyGroup' },
    enrollmentNumber: { type: String, trim: true, sparse: true },
    employeeId: { type: String, trim: true, sparse: true },
    mustChangePassword: { type: Boolean, default: false },
    isInvitePending: { type: Boolean, default: false },
}, { timestamps: true });

UserSchema.index({ department_id: 1 });
UserSchema.index({ facultyGroupId: 1 });
UserSchema.index({ role: 1 });
UserSchema.index({ isActive: 1 });
UserSchema.index({ enrollmentNumber: 1 }, { sparse: true, unique: true });
UserSchema.index({ employeeId: 1 }, { sparse: true, unique: true });

const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>('User', UserSchema);
export default User;
