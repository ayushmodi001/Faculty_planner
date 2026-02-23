'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createFacultyGroup } from '@/app/actions/faculty';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, X, Plus } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { SearchableSelect } from '@/components/ui/searchable-select';

export default function CreateFacultyGroupForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        currentSubject: '',
        subjects: [] as string[],
        currentFaculty: '',
        members: [] as string[],
        currentStudent: '',
        students: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [availableSubjects, setAvailableSubjects] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [availableFaculties, setAvailableFaculties] = useState<{ name: string, email: string }[]>([]);
    const [availableStudents, setAvailableStudents] = useState<{ _id: string, name: string, email: string }[]>([]);

    useEffect(() => {
        const fetchResources = async () => {
            try {
                // Fetch Subjects
                const resSub = await fetch('/api/admin/subjects');
                const dataSub = await resSub.json();
                if (dataSub.success) setAvailableSubjects(dataSub.subjects);

                // Fetch Faculty
                const resFac = await fetch('/api/admin/users/list?role=FACULTY');
                const dataFac = await resFac.json();
                if (dataFac.success) setAvailableFaculties(dataFac.users);

                // Fetch Students
                const resStud = await fetch('/api/admin/users/list?role=STUDENT');
                const dataStud = await resStud.json();
                if (dataStud.success) setAvailableStudents(dataStud.users);
            } catch (err) {
                console.error(err);
            }
        };
        fetchResources();
    }, []);

    const handleAddSubject = () => {
        if (formData.currentSubject.trim() === '') return;
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, prev.currentSubject.trim()],
            currentSubject: ''
        }));
    };

    const removeSubject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const handleAddFaculty = () => {
        if (formData.currentFaculty.trim() === '') return;
        if (formData.members.includes(formData.currentFaculty)) return;
        setFormData(prev => ({
            ...prev,
            members: [...prev.members, prev.currentFaculty],
            currentFaculty: ''
        }));
    };

    const removeFaculty = (index: number) => {
        setFormData(prev => ({
            ...prev,
            members: prev.members.filter((_, i) => i !== index)
        }));
    };

    const handleAddStudent = () => {
        if (formData.currentStudent.trim() === '') return;
        if (formData.students.includes(formData.currentStudent)) return;
        setFormData(prev => ({
            ...prev,
            students: [...prev.students, prev.currentStudent],
            currentStudent: ''
        }));
    };

    const removeStudent = (index: number) => {
        setFormData(prev => ({
            ...prev,
            students: prev.students.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.subjects.length === 0) {
            setError('Please add at least one subject');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await createFacultyGroup({
            name: formData.name,
            subjects: formData.subjects,
            members: formData.members,
            students: formData.students
            // Timetable will be handled in a separate step
        });

        if (result.success) {
            router.push('/admin/faculty');
            router.refresh();
        } else {
            setError(result.error || 'Something went wrong');
        }

        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8 text-center space-y-2">
                <SwissSubHeading className="text-primary tracking-widest uppercase">Configuration</SwissSubHeading>
                <SwissHeading className="text-3xl font-bold tracking-tight text-foreground">Create New Faculty Group</SwissHeading>
                <p className="text-muted-foreground text-sm max-w-sm mx-auto">
                    Define a new academic group and assign the subjects they are responsible for teaching this semester.
                </p>
            </div>

            <Card className="border shadow-lg">
                <CardContent className="pt-6">
                    {error && (
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive text-sm p-3 mb-6 rounded-md flex items-center justify-between">
                            <span>{error}</span>
                            <X className="w-4 h-4 cursor-pointer hover:text-red-700" onClick={() => setError(null)} />
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">

                        {/* Group Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Group Name Identifier</label>
                            <input
                                type="text"
                                placeholder="e.g. CS-Sem5-DivA"
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                            <p className="text-xs text-muted-foreground">Unique identifier for this faculty cohort.</p>
                        </div>

                        <div className="border-t border-border"></div>

                        {/* Subjects */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Assigned Subjects</label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableSubjects.map(sub => ({ value: sub.name, label: `${sub.name} (${sub.code})` }))}
                                    value={formData.currentSubject}
                                    onValueChange={(val) => setFormData({ ...formData, currentSubject: val })}
                                    placeholder="Select Subject"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddSubject}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>

                            {/* Subject Pills */}
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {formData.subjects.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic w-full text-center">No subjects added yet. Type above and press Enter.</span>
                                ) : (
                                    formData.subjects.map((sub, idx) => (
                                        <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal">
                                            {sub}
                                            <button
                                                type="button"
                                                onClick={() => removeSubject(idx)}
                                                className="hover:bg-primary/90 rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3 text-white" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border"></div>

                        {/* Associated Faculties */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Associated Faculties</label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableFaculties.map(fac => ({ value: fac.name, label: fac.name }))}
                                    value={formData.currentFaculty}
                                    onValueChange={(val) => setFormData({ ...formData, currentFaculty: val })}
                                    placeholder="Select Faculty Member"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddFaculty}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>

                            {/* Faculty Pills */}
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {formData.members.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic w-full text-center">No faculties assigned yet. Select above.</span>
                                ) : (
                                    formData.members.map((fac, idx) => (
                                        <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal bg-background text-foreground border">
                                            {fac}
                                            <button
                                                type="button"
                                                onClick={() => removeFaculty(idx)}
                                                className="hover:bg-primary/90 hover:text-white rounded-full p-0.5 transition-colors"
                                            >
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    ))
                                )}
                            </div>
                        </div>

                        <div className="border-t border-border"></div>

                        {/* Associated Students */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Associated Students</label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableStudents.map(stud => ({ value: stud._id, label: `${stud.name} (${stud.email})` }))}
                                    value={formData.currentStudent}
                                    onValueChange={(val) => setFormData({ ...formData, currentStudent: val })}
                                    placeholder="Select Student"
                                    className="flex-1"
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleAddStudent}
                                    className="gap-2"
                                >
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>

                            {/* Student Pills */}
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {formData.students.length === 0 ? (
                                    <span className="text-sm text-muted-foreground italic w-full text-center">No students assigned yet. Select above.</span>
                                ) : (
                                    formData.students.map((studId, idx) => {
                                        const stud = availableStudents.find(s => s._id === studId);
                                        return (
                                            <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal bg-blue-100 text-blue-900 border border-blue-200">
                                                {stud ? stud.name : studId}
                                                <button
                                                    type="button"
                                                    onClick={() => removeStudent(idx)}
                                                    className="hover:bg-blue-600 hover:text-white rounded-full p-0.5 transition-colors"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            </Badge>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        <div className="pt-6">
                            <Button type="submit" disabled={loading} className="w-full">
                                {loading ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving Configuration...
                                    </>
                                ) : (
                                    'Create Faculty Group'
                                )}
                            </Button>
                        </div>

                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
