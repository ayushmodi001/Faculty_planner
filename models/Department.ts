import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    code?: string;
    hod_id?: mongoose.Types.ObjectId;
    subject_ids?: mongoose.Types.ObjectId[];
}

const DepartmentSchema = new Schema<IDepartment>(
    {        name: { type: String, required: true, unique: true, trim: true },
        code: { type: String, trim: true, unique: true, sparse: true },
        hod_id: { type: Schema.Types.ObjectId, ref: 'User' },
        subject_ids: [{ type: Schema.Types.ObjectId, ref: 'Subject' }]
    },
    { timestamps: true }
);

DepartmentSchema.index({ hod_id: 1 });

export default models.Department || model<IDepartment>('Department', DepartmentSchema);
