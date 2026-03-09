'use server';

import dbConnect from '@/lib/db';
import FacultyGroup, { IFacultyGroup } from '@/models/FacultyGroup';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Input validation schema for creating a faculty group
const SubjectAssignmentSchema = z.object({
    subject_id: z.string(),
    faculty_id: z.string(),
});

const CreateFacultyGroupSchema = z.object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    subjects: z.array(z.string()).min(1, "At least one subject is required"),
    members: z.array(z.string()).optional(),
    students: z.array(z.string()).optional(),
    subjectAssignments: z.array(SubjectAssignmentSchema).optional(),
    year: z.number().int().min(1).max(4).default(1),
    semester: z.number().int().min(1).max(8).default(1),
    section: z.string().optional(),
    timetable: z.record(
        z.string(),
        z.array(z.object({
            startTime: z.string(),
            endTime: z.string(),
            room: z.string().optional(),
            subject: z.string().optional(),
            faculty: z.string().optional(),
            type: z.string().optional()
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
        }        const SubjectModel = (await import('@/models/Subject')).default;
        const UserModel = (await import('@/models/User')).default;

        // Resolve subject names to ObjectIds (for subjectAssignments)
        const foundSubjects = await SubjectModel.find({ name: { $in: validatedData.subjects } });
        const subjectIdMap = new Map(foundSubjects.map(s => [s.name, s._id]));

        // Resolve faculty names to ObjectIds
        const foundFaculty = await UserModel.find({ name: { $in: validatedData.members || [] } });
        const faculty_ids = foundFaculty.map(f => f._id);

        // Build subjectAssignments: merge provided assignments + auto-pair unassigned subjects
        const providedAssignments = (validatedData.subjectAssignments || []).filter(a => a.subject_id && a.faculty_id);
        const assignedSubjectIds = new Set(providedAssignments.map(a => a.subject_id));
        const autoAssignments = foundSubjects
            .filter(s => !assignedSubjectIds.has(s._id.toString()))
            .map(s => ({ subject_id: s._id.toString(), faculty_id: faculty_ids[0]?.toString() }))
            .filter(a => a.faculty_id);
        const subjectAssignments = [...providedAssignments, ...autoAssignments];

        const facultyData = {
            name: validatedData.name,
            faculty_ids,
            subjectAssignments,
            year: validatedData.year ?? 1,
            semester: validatedData.semester ?? 1,
            section: validatedData.section?.toUpperCase() || undefined,
            timetable: validatedData.timetable
                ? new Map(Object.entries(validatedData.timetable))
                : undefined
        };

        const newGroup = await FacultyGroup.create(facultyData);

        // Assign students: set facultyGroupId (ObjectId) on each student User
        if (validatedData.students && validatedData.students.length > 0) {
            await UserModel.updateMany(
                { _id: { $in: validatedData.students } },
                { $set: { facultyGroupId: newGroup._id } }
            );
        }

        revalidatePath('/admin/faculty');

        // Convert to plain object to avoid serialization issues with Client Components
        return { success: true, data: JSON.parse(JSON.stringify(newGroup)) };
    } catch (error) {
        console.error('Error creating faculty group:', error);
        if (error instanceof z.ZodError) {
            return { success: false, error: error.issues[0]?.message || 'Validation Failed' };
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

        // Ensure models are registered for population
        await import('@/models/Subject');
        await import('@/models/User');        const groups = await FacultyGroup.find({})
            .populate('faculty_ids', 'name')
            .populate('subjectAssignments.subject_id', 'name')
            .sort({ createdAt: -1 })
            .lean();

        // Derive unique subjects from subjectAssignments (single source of truth)
        const mappedGroups = groups.map((g: any) => {
            const subjectNames = [...new Set<string>(
                (g.subjectAssignments || []).map((a: any) => a.subject_id?.name).filter(Boolean)
            )];
            return {
                ...g,
                subjects: subjectNames,
                members: g.faculty_ids?.map((f: any) => f.name) || [],
                year: g.year || 1,
                semester: g.semester || 1,
                section: g.section || '',
            };
        });

        return { success: true, data: JSON.parse(JSON.stringify(mappedGroups)) };
    } catch (error) {
        console.error('Error fetching faculty groups:', error);
        return { success: false, error: 'Failed to fetch faculty groups' };
    }
}

/**
 * Fetches the latest academic plan for a given faculty group ID.
 * @param groupId The ID of the faculty group
 */
export async function getPlanForGroup(groupId: string, subject?: string) {
    try {
        await dbConnect();
        const Plan = (await import('@/models/Plan')).default;
        const SubjectModel = (await import('@/models/Subject')).default;

        const query: any = { faculty_group_id: groupId };
        if (subject) {
            const targetSub = await SubjectModel.findOne({ name: subject });
            if (targetSub) {
                query.subject_id = targetSub._id;
            } else {
                return { success: false, error: "Subject not found" };
            }
        }

        const plan = await Plan.findOne(query)
            .populate('subject_id', 'name')
            .sort({ createdAt: -1 })
            .lean();

        if (!plan) return { success: false, error: "No plan found" };

        // Ensure subject name is passed for the UI
        const mappedPlan = {
            ...plan,
            subject: plan.subject_id?.name || subject
        };

        return { success: true, data: JSON.parse(JSON.stringify(mappedPlan)) };
    } catch (error) {
        console.error('Error fetching plan:', error);
        return { success: false, error: 'Failed to fetch plan' };
    }
}

/**
 * Fetches all Faculty Groups where a specific faculty is a member.
 * @param facultyId - The User ID of the faculty
 */
export async function getFacultyGroupsByFaculty(facultyId: string) {
    try {
        await dbConnect();
        await import('@/models/Subject');        const groups = await FacultyGroup.find({ faculty_ids: facultyId })
            .populate('faculty_ids', 'name')
            .populate('subjectAssignments.subject_id', 'name')
            .sort({ createdAt: -1 })
            .lean();

        const mappedGroups = groups.map((g: any) => {
            const subjectNames = [...new Set<string>(
                (g.subjectAssignments || []).map((a: any) => a.subject_id?.name).filter(Boolean)
            )];
            return {
                ...g,
                subjects: subjectNames,
                members: g.faculty_ids?.map((f: any) => f.name) || [],
            };
        });

        return { success: true, data: JSON.parse(JSON.stringify(mappedGroups)) };
    } catch (error) {
        console.error('Error fetching groups for faculty:', error);
        return { success: false, error: 'Failed to fetch your faculty groups' };
    }
}
