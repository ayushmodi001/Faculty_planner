import { z } from 'zod';

export const AIPlanTopicSchema = z.object({
    week: z.number().optional(), // Made optional as route.ts might not use it
    day_of_week: z.string().optional(),
    title: z.string(),
    duration_mins: z.number().default(60),
    is_self_study: z.boolean().default(false),
    priority: z.enum(['CORE', 'PREREQUISITE', 'SELF_STUDY']).default('CORE').optional(), // Optional to accept various inputs
    lecture_sequence: z.number().optional(),
    sequence_order: z.number().optional(), // Add alias for flexibility
    reason_for_decision: z.string().optional()
});

// Original Schema (if used elsewhere)
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

// New Schema matching route.ts prompt
export const AIPlanResponseSchema = z.object({
    topics: z.array(AIPlanTopicSchema),
    total_lectures_planned: z.number().optional(),
    metadata: z.record(z.string(), z.any()).optional()
});

// ensuring proper export for route.ts
