import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ISlot {
    startTime: string; // "10:00"
    endTime: string;   // "11:00"
    room?: string;
    subject_id?: mongoose.Types.ObjectId;
    faculty_id?: mongoose.Types.ObjectId;
    type?: string;
}

export interface ISubjectAssignment {
    subject_id: mongoose.Types.ObjectId;
    faculty_id: mongoose.Types.ObjectId;
}

export interface IFacultyGroup extends Document {
    name: string;
    department_id?: mongoose.Types.ObjectId;
    faculty_ids?: mongoose.Types.ObjectId[];   // Array of Faculty User IDs
    subjectAssignments?: ISubjectAssignment[]; // subject → faculty mappings (single source of truth)
    // --- Academic Year Segregation ---
    year: number;        // 1, 2, 3, 4 (Academic Year)
    semester: number;    // 1–8 (Odd = first half, Even = second half)
    section?: string;    // e.g., "A", "B", "C"
    // --- Virtual / Populated fields ---
    subjects?: any[];
    members?: any[];
    students?: any[];
    timetable: Map<string, ISlot[]>; // Key: "Monday" -> Slots
    termStartDate?: Date;
    termEndDate?: Date;
}

const SlotSchema = new Schema<ISlot>({
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    room: { type: String },
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject' },
    faculty_id: { type: Schema.Types.ObjectId, ref: 'User' },
    type: { type: String },
}, { _id: false });

const SubjectAssignmentSchema = new Schema<ISubjectAssignment>({
    subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
}, { _id: false });

const FacultyGroupSchema = new Schema<IFacultyGroup>(
    {
        name: { type: String, required: true },
        department_id: { type: Schema.Types.ObjectId, ref: 'Department' },
        faculty_ids: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        subjectAssignments: { type: [SubjectAssignmentSchema], default: [] },
        // Academic Year Segregation
        year: { type: Number, required: true, min: 1, max: 4, default: 1 },
        semester: { type: Number, required: true, min: 1, max: 8, default: 1 },
        section: { type: String, trim: true, uppercase: true },
        // Timetable: Map<DayName, Slots[]>
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

// Indexes
FacultyGroupSchema.index({ department_id: 1 });
FacultyGroupSchema.index({ faculty_ids: 1 });
// Composite unique index: one group per dept+year+semester+section combination
FacultyGroupSchema.index(
    { department_id: 1, year: 1, semester: 1, section: 1 },
    { unique: true, sparse: true }
);
FacultyGroupSchema.index({ department_id: 1, year: 1, semester: 1 });

export default models.FacultyGroup || model<IFacultyGroup>('FacultyGroup', FacultyGroupSchema);
