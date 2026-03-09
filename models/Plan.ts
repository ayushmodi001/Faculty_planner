import mongoose, { Schema, Document, model, models } from 'mongoose';

export type MissedReason =
    | 'ON_LEAVE'
    | 'TOPIC_TOOK_LONGER'
    | 'HOLIDAY_CLASH'
    | 'TECHNICAL_ISSUE'
    | 'LOW_ATTENDANCE'
    | 'OTHER';

export interface ITopic {
    name: string;
    original_duration_mins: number;
    lecture_sequence: number;
    is_split: boolean;
    priority: 'CORE' | 'PREREQUISITE' | 'SELF_STUDY';
    scheduled_date?: Date;
    assigned_faculty_id?: mongoose.Types.ObjectId; // For split syllabus
    completion_status: 'PENDING' | 'DONE' | 'MISSED' | 'CONTINUED';
    notes?: string;
    // Reason tracking for MISSED / CONTINUED
    missed_reason?: MissedReason;
    missed_reason_custom?: string; // Filled when missed_reason === 'OTHER'
    marked_at?: Date; // Timestamp when status was last changed
}

export interface IPlan extends Document {
    faculty_group_id: mongoose.Types.ObjectId; // Cohort being taught
    faculty_ids: mongoose.Types.ObjectId[]; // The User IDs teaching (Multiple for split)
    subject_id: mongoose.Types.ObjectId;
    department_id?: mongoose.Types.ObjectId;
    subject?: any;
    events_id?: mongoose.Types.ObjectId[]; // Calender Events interfering
    lecture_duration_mins: number;
    total_slots_available: number;
    status: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    syllabus_topics: ITopic[];
}

const TopicSchema = new Schema<ITopic>({
    name: { type: String, required: true },
    original_duration_mins: { type: Number, required: true },
    lecture_sequence: { type: Number, required: true },
    is_split: { type: Boolean, default: false },
    priority: {
        type: String,
        enum: ['CORE', 'PREREQUISITE', 'SELF_STUDY'],
        required: true,
    },
    scheduled_date: { type: Date },
    assigned_faculty_id: { type: Schema.Types.ObjectId, ref: 'User' },    completion_status: {
        type: String,
        enum: ['PENDING', 'DONE', 'MISSED', 'CONTINUED'],
        default: 'PENDING',
    },
    notes: { type: String },
    missed_reason: {
        type: String,
        enum: ['ON_LEAVE', 'TOPIC_TOOK_LONGER', 'HOLIDAY_CLASH', 'TECHNICAL_ISSUE', 'LOW_ATTENDANCE', 'OTHER'],
    },
    missed_reason_custom: { type: String },
    marked_at: { type: Date },
}, { _id: false });

const PlanSchema = new Schema<IPlan>(
    {        faculty_group_id: { type: Schema.Types.ObjectId, ref: 'FacultyGroup', required: true },
        faculty_ids: [{ type: Schema.Types.ObjectId, ref: 'User' }],
        subject_id: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
        department_id: { type: Schema.Types.ObjectId, ref: 'Department' },
        events_id: [{ type: Schema.Types.ObjectId, ref: 'CalendarEvent' }],
        lecture_duration_mins: { type: Number, default: 60 },
        total_slots_available: { type: Number, required: true },
        status: {
            type: String,
            enum: ['DRAFT', 'ACTIVE', 'ARCHIVED'],
            default: 'DRAFT',
        },
        syllabus_topics: [TopicSchema],
    },
    { timestamps: true }
);

// Indexes
PlanSchema.index({ faculty_group_id: 1, subject_id: 1 });

export default models.Plan || model<IPlan>('Plan', PlanSchema);
