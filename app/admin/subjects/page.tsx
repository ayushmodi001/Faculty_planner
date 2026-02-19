'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Input } from "@/components/ui/input";
import { Plus, Trash2, BookOpen, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface ISubject {
    _id: string;
    name: string;
    code: string;
    faculties: string[];
}

export default function SubjectsPage() {
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initial Fetch
    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/admin/subjects');
            const data = await res.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            toast.error("Failed to load subjects");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSubjects();
    }, []);

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newName || !newCode) return;

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, code: newCode, faculties: [] })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Subject Created");
                setNewName("");
                setNewCode("");
                fetchSubjects();
            } else {
                toast.error(data.error || "Failed to create");
            }
        } catch (error) {
            toast.error("Error creating subject");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this subject?")) return;
        try {
            const res = await fetch(`/api/admin/subjects?id=${id}`, { method: 'DELETE' });
            if (res.ok) {
                toast.success("Deleted");
                setSubjects(prev => prev.filter(s => s._id !== id));
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    return (
        <DashboardLayout role="HOD">
            <div className="max-w-5xl mx-auto space-y-8 animate-in slide-in-from-bottom-5">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between md:items-end gap-4 border-b border-border pb-6">
                    <div>
                        <SwissSubHeading className="text-primary mb-1">Curriculum Management</SwissSubHeading>
                        <SwissHeading>Subjects Registry</SwissHeading>
                        <p className="text-muted-foreground mt-2">Define global subjects and codes used across the department.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

                    {/* Form Section */}
                    <div className="md:col-span-1">
                        <Card className="sticky top-24">
                            <CardHeader>
                                <CardTitle className="text-lg">Add New Subject</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleCreate} className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject Name</label>
                                        <Input
                                            placeholder="e.g. Operating Systems"
                                            value={newName}
                                            onChange={(e) => setNewName(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Subject Code</label>
                                        <Input
                                            placeholder="e.g. CS502"
                                            value={newCode}
                                            onChange={(e) => setNewCode(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                                        {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                        Register Subject
                                    </Button>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* List Section */}
                    <div className="md:col-span-2">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    Active Subjects ({subjects.length})
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {loading ? (
                                    <div className="p-8 flex justify-center"><Loader2 className="w-8 h-8 animate-spin text-muted-foreground" /></div>
                                ) : subjects.length === 0 ? (
                                    <div className="p-8 text-center text-muted-foreground italic">No subjects defined yet.</div>
                                ) : (
                                    <div className="divide-y divide-border">
                                        {subjects.map(sub => (
                                            <div key={sub._id} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors group">
                                                <div>
                                                    <div className="font-medium text-foreground">{sub.name}</div>
                                                    <div className="text-sm text-primary font-mono">{sub.code}</div>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleDelete(sub._id)}
                                                    className="opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive hover:bg-destructive/10 transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </DashboardLayout>
    );
}
