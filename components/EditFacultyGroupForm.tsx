'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createFacultyGroup, getAllFacultyGroups } from '@/app/actions/faculty'; // We might need an update action
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, X, Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

interface EditFacultyGroupFormProps {
    groupId: string;
    initialData: {
        name: string;

        subjects: string[];
        members?: string[];
    };
}

export default function EditFacultyGroupForm({ groupId, initialData }: EditFacultyGroupFormProps) {
    const router = useRouter();
    const [formData, setFormData] = useState(initialData);
    const [currentSubject, setCurrentSubject] = useState('');
    const [loading, setLoading] = useState(false);
    const [availableSubjects, setAvailableSubjects] = useState<{ _id: string, name: string, code: string }[]>([]);
    const [availableFaculties, setAvailableFaculties] = useState<{ name: string, email: string }[]>([]);
    const [currentFaculty, setCurrentFaculty] = useState('');

    useEffect(() => {
        const fetchResources = async () => {
            try {
                const res = await fetch('/api/admin/subjects');
                const data = await res.json();
                if (data.success) setAvailableSubjects(data.subjects);

                const resFac = await fetch('/api/admin/users/list?role=FACULTY');
                const dataFac = await resFac.json();
                if (dataFac.success) setAvailableFaculties(dataFac.users);
            } catch (err) {
                console.error(err);
            }
        };
        fetchResources();
    }, []);

    const handleAddSubject = () => {
        if (currentSubject.trim() === '') return;
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, currentSubject.trim()]
        }));
        setCurrentSubject('');
    };

    const removeSubject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const handleAddFaculty = () => {
        if (currentFaculty.trim() === '') return;
        // Check duplicates
        if (formData.members?.includes(currentFaculty)) return;

        setFormData(prev => ({
            ...prev,
            members: [...(prev.members || []), currentFaculty.trim()]
        }));
        setCurrentFaculty('');
    };

    const removeFaculty = (index: number) => {
        setFormData(prev => ({
            ...prev,
            members: (prev.members || []).filter((_, i) => i !== index)
        }));
    };

    // We need a Server Action for Updating. For now, I'll simulate or use a raw fetch if action doesn't exist.
    // I'll assume we need to create `updateFacultyGroup`.
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?id=${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to update");
            }

            toast.success("Group Updated Successfully");
            router.push('/admin/faculty');
            router.refresh();
        } catch (error: any) {
            console.error("Update Error:", error);
            toast.error(error.message || "Error updating group");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this group?")) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?id=${groupId}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("Group Deleted");
            router.push('/admin/faculty');
            router.refresh();
        } catch (error) {
            toast.error("Error deleting group");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8 ">
                <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.push('/admin/faculty')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <SwissSubHeading className="text-primary tracking-widest uppercase">Configuration</SwissSubHeading>
                <SwissHeading className="text-3xl font-bold tracking-tight text-foreground">Edit Faculty Group</SwissHeading>
            </div>

            <Card className="border shadow-lg">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Group Name</label>
                            <input
                                type="text"
                                className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Assigned Subjects</label>
                            <div className="flex gap-2 mb-3">
                                <select
                                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={currentSubject}
                                    onChange={(e) => setCurrentSubject(e.target.value)}
                                >
                                    <option value="" disabled>Select Subject to Add</option>
                                    {availableSubjects.map(sub => (
                                        <option key={sub._id} value={sub.name}>{sub.name} ({sub.code})</option>
                                    ))}
                                </select>
                                <Button type="button" variant="secondary" onClick={handleAddSubject}>
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {formData.subjects.map((sub, idx) => (
                                    <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal">
                                        {sub}
                                        <button type="button" onClick={() => removeSubject(idx)} className="hover:bg-primary/90 rounded-full p-0.5">
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Associated Faculties</label>
                            <div className="flex gap-2 mb-3">
                                <select
                                    className="flex-1 bg-background border border-input rounded-md px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                                    value={currentFaculty}
                                    onChange={(e) => setCurrentFaculty(e.target.value)}
                                >
                                    <option value="" disabled>Select Faculty to Add</option>
                                    {availableFaculties.map(fac => (
                                        <option key={fac.email} value={fac.name}>{fac.name}</option>
                                    ))}
                                </select>
                                <Button type="button" variant="secondary" onClick={handleAddFaculty}>
                                    <Plus className="w-4 h-4" /> Add
                                </Button>
                            </div>

                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {(formData.members || []).map((fac, idx) => (
                                    <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal bg-background border text-foreground">
                                        {fac}
                                        <button type="button" onClick={() => removeFaculty(idx)} className="hover:bg-primary/90 hover:text-white rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {(formData.members || []).length === 0 && (
                                    <span className="text-sm text-muted-foreground italic w-full text-center">No faculties assigned.</span>
                                )}
                            </div>
                        </div>

                        <div className="pt-6 flex gap-4">
                            <Button type="button" variant="destructive" onClick={handleDelete} disabled={loading}>
                                <Trash2 className="w-4 h-4 mr-2" /> Delete Group
                            </Button>
                            <Button type="submit" disabled={loading} className="flex-1">
                                {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                Update Group
                            </Button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
