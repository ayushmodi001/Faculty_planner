import { z } from 'zod';

export const AIPlanTopicSchema = z.object({
    week: z.number(),
    day_of_week: z.string().optional(),
    title: z.string(),
    duration_mins: z.number(),
    is_self_study: z.boolean().default(false),
    priority: z.enum(['CORE', 'PREREQUISITE', 'SELF_STUDY']).default('CORE'),
    lecture_sequence: z.number().optional()
});

export const AIPlanSchema = z.object({
    schedule: z.array(z.object({
        week: z.number(),
        startDate: z.string(),
        endDate: z.string(),
        topics: z.array(AIPlanTopicSchema)
    })),
    metrics: z.object({
        total_weeks: z.number(),
        total_lectures: z.number(),
        completion_date: z.string()
    })
});
