import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICollegeSettings extends Document {
    collegeStartTime: string;
    collegeEndTime: string;
    slotDurationHours: number;
    labDurationHours: number;
    breakStartTime: string;
    breakDurationHours: number;
    institutionName?: string;
    institutionShortName?: string;    contactEmail?: string;
    address?: string;
    allowedEmailDomains?: string[]; // e.g. ["university.edu", "college.ac.in"]
}

const CollegeSettingsSchema = new Schema<ICollegeSettings>(
    {
        collegeStartTime: { type: String, default: "09:00" },
        collegeEndTime: { type: String, default: "16:00" },
        slotDurationHours: { type: Number, default: 1 },
        labDurationHours: { type: Number, default: 2 },
        breakStartTime: { type: String, default: "13:00" },
        breakDurationHours: { type: Number, default: 1 },
        institutionName: { type: String, default: "University Academic Planning System" },
        institutionShortName: { type: String, default: "UAPS" },        contactEmail: { type: String },
        address: { type: String },
        allowedEmailDomains: { type: [String], default: [] },
    },
    { timestamps: true }
);

export default models.CollegeSettings || model<ICollegeSettings>('CollegeSettings', CollegeSettingsSchema);
