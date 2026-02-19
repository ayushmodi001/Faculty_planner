import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISlot {
    startTime: string; // "10:00"
    endTime: string;   // "11:00"
    room?: string;
    subject?: string;
    faculty?: string;
    type?: string;
}

export interface IFacultyGroup extends Document {
    name: string;
    subjects: string[];
    members?: string[];
    timetable: Map<string, ISlot[]>; // Key: "Monday" -> Slots
    termStartDate?: Date;
    termEndDate?: Date;
}

const SlotSchema = new Schema<ISlot>({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    subject: { type: String },
    faculty: { type: String },
    type: { type: String }
}, { _id: false });

const FacultyGroupSchema = new Schema<IFacultyGroup>(
    {
        name: { type: String, required: true, unique: true },
        subjects: [{ type: String }],
        members: [{ type: String }], // Array of Faculty Names
        timetable: {
            type: Map,
            of: [SlotSchema],
            default: {},
        },
        termStartDate: { type: Date },
        termEndDate: { type: Date },
    },
    { timestamps: true }
);

export default models.FacultyGroup || model<IFacultyGroup>('FacultyGroup', FacultyGroupSchema);
