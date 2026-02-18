import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IHoliday {
    date: Date;
    reason: string;
}

export interface IAcademicCalendar extends Document {
    year: number;
    holidays: IHoliday[];
    working_days_override: Date[];
}

const HolidaySchema = new Schema<IHoliday>({
    date: { type: Date, required: true },
    reason: { type: String, required: true },
}, { _id: false });

const AcademicCalendarSchema = new Schema<IAcademicCalendar>(
    {
        year: { type: Number, required: true, unique: true },
        holidays: [HolidaySchema],
        working_days_override: [{ type: Date }],
    },
    { timestamps: true }
);

// Index for faster querying by year (already unique, but explicit index is good)
// AcademicCalendarSchema.index({ year: 1 }); // Removed to prevent "Duplicate schema index" warning

export default models.AcademicCalendar || model<IAcademicCalendar>('AcademicCalendar', AcademicCalendarSchema);
