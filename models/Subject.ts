import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISubject extends Document {
    name: string;
    code: string;
    // We can link specific faculties to this subject (optional, "who CAN teach this")
    faculties?: string[]; // Storing faculty names or IDs for now. Names are easier for existing dropdowns.
}

const SubjectSchema = new Schema<ISubject>(
    {
        name: { type: String, required: true },
        code: { type: String, required: true, unique: true },
        faculties: [{ type: String }],
    },
    { timestamps: true }
);

export default models.Subject || model<ISubject>('Subject', SubjectSchema);
