import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface ITopic {
    name: string;
    original_duration_mins: number;
    lecture_sequence: number;
    is_split: boolean;
    priority: 'CORE' | 'PREREQUISITE' | 'SELF_STUDY';
    scheduled_date?: Date;
    completion_status: 'PENDING' | 'DONE' | 'MISSED';
    notes?: string;
}

export interface IPlan extends Document {
    faculty_id: mongoose.Types.ObjectId;
    subject: string;
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
    completion_status: {
        type: String,
        enum: ['PENDING', 'DONE', 'MISSED'],
        default: 'PENDING',
    },
    notes: { type: String },
}, { _id: false });

const PlanSchema = new Schema<IPlan>(
    {
        faculty_id: { type: Schema.Types.ObjectId, ref: 'FacultyGroup', required: true },
        subject: { type: String, required: true },
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
PlanSchema.index({ faculty_id: 1, subject: 1 });

export default models.Plan || model<IPlan>('Plan', PlanSchema);
