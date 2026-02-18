import { z } from 'zod';

export const AIPlanTopicSchema = z.object({
    title: z.string().describe("The name of the topic"),
    duration_mins: z.number().describe("Estimated duration in minutes"),
    is_self_study: z.boolean().describe("Whether this topic should be self-study due to time constraints"),
    reason_for_decision: z.string().describe("Why this topic was split or marked as self-study"),
    is_split: z.boolean().optional().default(false).describe("True if this is part of a larger topic (Part 1/2)"),
    sequence_order: z.number().describe("The logical sequence order")
});

export const AIPlanResponseSchema = z.object({
    topics: z.array(AIPlanTopicSchema),
    total_lectures_planned: z.number(),
    metadata: z.object({
        original_syllabus_length: z.number(),
        complexity_score: z.number().min(1).max(10),
        usage_of_budget: z.string() // e.g. "40/40 slots used"
    })
});

export type AIPlanResponse = z.infer<typeof AIPlanResponseSchema>;
