import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISlot {
    startTime: string; // "10:00"
    endTime: string;   // "11:00"
    room?: string;
}

export interface IFacultyGroup extends Document {
    name: string;
    subjects: string[];
    timetable: Map<string, ISlot[]>; // Key: "Monday" -> Slots
}

const SlotSchema = new Schema<ISlot>({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
}, { _id: false });

const FacultyGroupSchema = new Schema<IFacultyGroup>(
    {
        name: { type: String, required: true, unique: true },
        subjects: [{ type: String }],
        timetable: {
            type: Map,
            of: [SlotSchema],
            default: {},
        },
    },
    { timestamps: true }
);

export default models.FacultyGroup || model<IFacultyGroup>('FacultyGroup', FacultyGroupSchema);
