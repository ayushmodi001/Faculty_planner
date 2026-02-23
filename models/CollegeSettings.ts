import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICollegeSettings extends Document {
    collegeStartTime: string; // "09:00"
    collegeEndTime: string;   // "16:00"
    slotDurationHours: number; // 1
}

const CollegeSettingsSchema = new Schema<ICollegeSettings>(
    {
        collegeStartTime: { type: String, default: "09:00" },
        collegeEndTime: { type: String, default: "16:00" },
        slotDurationHours: { type: Number, default: 1 }
    },
    { timestamps: true }
);

export default models.CollegeSettings || model<ICollegeSettings>('CollegeSettings', CollegeSettingsSchema);
