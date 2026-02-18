'use server';

import dbConnect from '@/lib/db';
import FacultyGroup, { IFacultyGroup } from '@/models/FacultyGroup';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Input validation schema for creating a faculty group
const CreateFacultyGroupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    subjects: z.array(z.string()).min(1, "At least one subject is required"),
    // Timetable is optional on creation, can be added later
    timetable: z.record(
        z.string(), // Key: Day name (e.g., "Monday")
        z.array(z.object({
            startTime: z.string(),
            endTime: z.string(),
            room: z.string().optional()
        }))
    ).optional()
});

export type CreateFacultyGroupInput = z.infer<typeof CreateFacultyGroupSchema>;

/**
 * Creates a new Faculty Group in the database.
 * @param data - The faculty group data (name, subjects, etc.)
 * @returns Object indicating success or failure
 */
export async function createFacultyGroup(data: CreateFacultyGroupInput) {
    try {
        await dbConnect();

        const validatedData = CreateFacultyGroupSchema.parse(data);

        // Check for duplicates
        const existing = await FacultyGroup.findOne({ name: validatedData.name });
        if (existing) {
            return { success: false, error: 'Faculty Group with this name already exists' };
        }

        // Convert the Zod 'Record' to a 'Map' which Mongoose expects for the timetable field
        const facultyData = {
            ...validatedData,
            timetable: validatedData.timetable
                ? new Map(Object.entries(validatedData.timetable))
                : undefined
        };

        const newGroup = await FacultyGroup.create(facultyData);

        revalidatePath('/admin/faculty');

        // Convert to plain object to avoid serialization issues with Client Components
        return { success: true, data: JSON.parse(JSON.stringify(newGroup)) };
    } catch (error) {
        console.error('Error creating faculty group:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.errors[0].message };
        }
        return { success: false, error: 'Failed to create faculty group' };
    }
}

/**
 * Fetches all Faculty Groups from the database.
 * @returns Array of faculty groups
 */
export async function getAllFacultyGroups() {
    try {
        await dbConnect();
        const groups = await FacultyGroup.find({}).sort({ createdAt: -1 }).lean();
        return { success: true, data: JSON.parse(JSON.stringify(groups)) };
    } catch (error) {
        console.error('Error fetching faculty groups:', error);
        return { success: false, error: 'Failed to fetch faculty groups' };
    }
}
