import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ICalendarEvent extends Document {
    title: string;
    description?: string;
    date: Date;
    type: 'HOLIDAY' | 'EXAM' | 'EVENT' | 'DEADLINE';
    createdBy: mongoose.Types.ObjectId; // Principal ID
}

const CalendarEventSchema = new Schema<ICalendarEvent>(
    {
        title: { type: String, required: true },
        description: { type: String },
        date: { type: Date, required: true },
        type: {
            type: String,
            enum: ['HOLIDAY', 'EXAM', 'EVENT', 'DEADLINE'],
            default: 'EVENT',
        },
        createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
    },
    { timestamps: true }
);

export default models.CalendarEvent || model<ICalendarEvent>('CalendarEvent', CalendarEventSchema);
