'use client';

import React, { useEffect, useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Input } from "@/components/ui/input";
import { Plus, Trash2, BookOpen, Loader2, Download, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRouter } from 'next/navigation';

interface ISubject {
    _id: string;
    name: string;
    code: string;
    faculties: string[];
    syllabus?: string;
}

export default function SubjectsPage() {
    const router = useRouter();
    const [subjects, setSubjects] = useState<ISubject[]>([]);
    const [loading, setLoading] = useState(true);

    // Form State
    const [newName, setNewName] = useState("");
    const [newCode, setNewCode] = useState("");
    const [syllabusFile, setSyllabusFile] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Edit State
    const [editingSubject, setEditingSubject] = useState<ISubject | null>(null);
    const [editName, setEditName] = useState("");
    const [editCode, setEditCode] = useState("");
    const [editSyllabus, setEditSyllabus] = useState("");

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

        let syllabusText = "";
        if (syllabusFile) {
            try {
                syllabusText = await syllabusFile.text();
            } catch (e) {
                toast.error("Could not read syllabus file");
                return;
            }
        }

        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: newName, code: newCode, faculties: [], syllabus: syllabusText })
            });
            const data = await res.json();

            if (data.success) {
                toast.success("Subject Created");
                setNewName("");
                setNewCode("");
                setSyllabusFile(null);
                fetchSubjects();
                router.refresh();
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
                router.refresh();
            }
        } catch (error) {
            toast.error("Delete failed");
        }
    };

    const handleEditSave = async () => {
        if (!editingSubject) return;
        try {
            const res = await fetch('/api/admin/subjects', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: editingSubject._id, name: editName, code: editCode, syllabus: editSyllabus })
            });
            const data = await res.json();
            if (data.success) {
                toast.success("Subject Updated");
                setEditingSubject(null);
                fetchSubjects();
                router.refresh();
            } else {
                toast.error(data.error || "Update failed");
            }
        } catch (err) {
            toast.error("Error updating subject");
        }
    };

    const handleDownloadSyllabus = (subject: ISubject) => {
        if (!subject.syllabus) {
            toast.error("No syllabus available for this subject");
            return;
        }
        const blob = new Blob([subject.syllabus], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${subject.code}_syllabus.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
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
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Syllabus File (Optional)</label>
                                        <Input
                                            type="file"
                                            accept=".txt,.csv"
                                            onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                                        />
                                        <p className="text-[10px] text-muted-foreground">Upload the syllabus text directly for AI planning</p>
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
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDownloadSyllabus(sub)}
                                                        className="text-primary hover:text-primary hover:bg-primary/10"
                                                        title="Download Syllabus"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => {
                                                            setEditingSubject(sub);
                                                            setEditName(sub.name);
                                                            setEditCode(sub.code);
                                                            setEditSyllabus(sub.syllabus || "");
                                                        }}
                                                        className="text-primary hover:text-primary hover:bg-primary/10"
                                                        title="Edit Subject"
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDelete(sub._id)}
                                                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>

            {/* Edit Dialog */}
            <Dialog open={!!editingSubject} onOpenChange={(open) => !open && setEditingSubject(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Subject</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 pt-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Name</label>
                            <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Code</label>
                            <Input value={editCode} onChange={(e) => setEditCode(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Syllabus Text</label>
                            <Textarea
                                className="h-32"
                                value={editSyllabus}
                                onChange={(e) => setEditSyllabus(e.target.value)}
                                placeholder="Raw syllabus text for AI..."
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setEditingSubject(null)}>Cancel</Button>
                        <Button onClick={handleEditSave}>Save Changes</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </DashboardLayout>
    );
}
