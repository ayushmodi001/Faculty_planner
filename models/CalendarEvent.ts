import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICalendarEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    endDate?: Date;
    type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'DEADLINE';
    createdBy: mongoose.Types.ObjectId; // Principal ID
    departments?: mongoose.Types.ObjectId[]; // If empty, applies to all
    facultyGroups?: mongoose.Types.ObjectId[]; // If empty, applies to all
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
    {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        endDate: { type: Date },
        type: {
            type: String,
            enum: ['HOLIDAY', 'EXAM', 'EVENT', 'DEADLINE'],
            default: 'EVENT',
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
        departments: [{ type: Schema.Types.ObjectId, ref: 'Department' }],
        facultyGroups: [{ type: Schema.Types.ObjectId, ref: 'FacultyGroup' }],
    },
    { timestamps: true }
);

export default models.CalendarEvent || model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
