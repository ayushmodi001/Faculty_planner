import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISubject extends Document {
    name: string;
    code: string;
    department_id?: mongoose.Types.ObjectId; // → Department
    /**
     * Faculty members qualified / allowed to teach this subject.
     * This is a pool — actual assignment per cohort lives on
     * FacultyGroup.subjectAssignments[].
     */
    faculty_ids?: mongoose.Types.ObjectId[];  // → User (FACULTY)
    syllabus?: string;
}

const SubjectSchema = new Schema<ISubject>(
    {
        name:          { type: String, required: true },
        code:          { type: String, required: true, unique: true },
        department_id: { type: Schema.Types.ObjectId, ref: 'Department' },
        faculty_ids:   [{ type: Schema.Types.ObjectId, ref: 'User' }],
        syllabus:      { type: String },
    },
    { timestamps: true }
);

SubjectSchema.index({ department_id: 1 });
SubjectSchema.index({ faculty_ids: 1 });

export default models.Subject || model<ISubject>('Subject', SubjectSchema);
