'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, Button, Badge, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Loader2, X, Plus, Trash2, Save, ArrowLeft, Link2, BookOpen, Users, GraduationCap } from 'lucide-react';
import { toast } from 'sonner';
import { SearchableSelect } from '@/components/ui/searchable-select';

interface SubjectAssignment {
    subjectId: string;
    subjectName: string;
    subjectCode?: string;
    facultyId: string;
    facultyName: string;
}

interface AvailableSubject { _id: string; name: string; code: string; }
interface AvailableFaculty { _id: string; name: string; email: string; employeeId?: string; }
interface AvailableStudent { _id: string; name: string; email: string; enrollmentNumber?: string; }

interface EditFacultyGroupFormProps {
    groupId: string;
    initialData: {
        name: string;
        year?: number;
        semester?: number;
        section?: string;
        // subjects now come as objects { _id, name, code } from the updated API
        subjects: Array<string | { _id: string; name: string; code?: string }>;
        // members now come as objects { _id, name, email, employeeId }
        members?: Array<string | { _id: string; name: string; email?: string; employeeId?: string }>;
        students?: string[];
        subjectAssignments?: Array<{
            subject_id: string; subject_name: string; subject_code?: string;
            faculty_id: string; faculty_name: string;
        }>;
        termStartDate?: Date | string;
        termEndDate?: Date | string;
    };
}

export default function EditFacultyGroupForm({ groupId, initialData }: EditFacultyGroupFormProps) {
    const router = useRouter();

    // ── basic fields ──────────────────────────────────────────────────────────
    const [name, setName] = useState(initialData.name);
    const [year, setYear] = useState(initialData.year ?? 1);
    const [semester, setSemester] = useState(initialData.semester ?? 1);
    const [section, setSection] = useState(initialData.section ?? '');
    const [termStartDate, setTermStartDate] = useState(
        initialData.termStartDate ? new Date(initialData.termStartDate).toISOString().split('T')[0] : ''
    );
    const [termEndDate, setTermEndDate] = useState(
        initialData.termEndDate ? new Date(initialData.termEndDate).toISOString().split('T')[0] : ''
    );

    // ── subjects: stored as { id, name, code } ────────────────────────────────
    const normaliseSubjects = (): Array<{ id: string; name: string; code: string }> =>
        (initialData.subjects || []).map(s =>
            typeof s === 'string' ? { id: '', name: s, code: '' } : { id: (s as any)._id ?? '', name: s.name, code: (s as any).code ?? '' }
        );
    const [selectedSubjects, setSelectedSubjects] = useState(normaliseSubjects);
    const [currentSubjectId, setCurrentSubjectId] = useState('');

    // ── faculty: stored as { id, name } ─────────────────────────────────────
    const normaliseMembers = (): Array<{ id: string; name: string }> =>
        (initialData.members || []).map(m =>
            typeof m === 'string' ? { id: '', name: m } : { id: (m as any)._id ?? '', name: m.name }
        );
    const [selectedFaculty, setSelectedFaculty] = useState(normaliseMembers);
    const [currentFacultyId, setCurrentFacultyId] = useState('');

    // ── students ──────────────────────────────────────────────────────────────
    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>(initialData.students ?? []);
    const [currentStudentId, setCurrentStudentId] = useState('');

    // ── subject assignments ───────────────────────────────────────────────────
    const normaliseAssignments = (): SubjectAssignment[] =>
        (initialData.subjectAssignments || []).map(a => ({
            subjectId: a.subject_id,
            subjectName: a.subject_name,
            subjectCode: a.subject_code,
            facultyId: a.faculty_id,
            facultyName: a.faculty_name,
        }));
    const [subjectAssignments, setSubjectAssignments] = useState(normaliseAssignments);
    const [assignSubjectId, setAssignSubjectId] = useState('');
    const [assignFacultyId, setAssignFacultyId] = useState('');

    // ── lookup data ───────────────────────────────────────────────────────────
    const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
    const [availableFaculties, setAvailableFaculties] = useState<AvailableFaculty[]>([]);
    const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [resSub, resFac, resStud] = await Promise.all([
                    fetch('/api/admin/subjects'),
                    fetch('/api/admin/users/list?role=FACULTY'),
                    fetch('/api/admin/users/list?role=STUDENT'),
                ]);
                const [dataSub, dataFac, dataStud] = await Promise.all([
                    resSub.json(), resFac.json(), resStud.json(),
                ]);
                if (dataSub.success) setAvailableSubjects(dataSub.subjects);
                if (dataFac.success) setAvailableFaculties(dataFac.users);
                if (dataStud.success) setAvailableStudents(dataStud.users);
            } catch (err) {
                console.error(err);
            }
        };
        load();
    }, []);

    // ── helpers ───────────────────────────────────────────────────────────────
    const subjectById = (id: string) => availableSubjects.find(s => s._id === id);
    const facultyById = (id: string) => availableFaculties.find(f => f._id === id);
    const studentById = (id: string) => availableStudents.find(s => s._id === id);

    // ── subject handlers ──────────────────────────────────────────────────────
    const addSubject = () => {
        if (!currentSubjectId) return;
        if (selectedSubjects.some(s => s.id === currentSubjectId)) return;
        const sub = subjectById(currentSubjectId);
        if (!sub) return;
        setSelectedSubjects(prev => [...prev, { id: sub._id, name: sub.name, code: sub.code }]);
        setCurrentSubjectId('');
    };
    const removeSubject = (id: string) => {
        setSelectedSubjects(prev => prev.filter(s => s.id !== id));
        setSubjectAssignments(prev => prev.filter(a => a.subjectId !== id));
    };

    // ── faculty handlers ──────────────────────────────────────────────────────
    const addFaculty = () => {
        if (!currentFacultyId) return;
        if (selectedFaculty.some(f => f.id === currentFacultyId)) return;
        const fac = facultyById(currentFacultyId);
        if (!fac) return;
        setSelectedFaculty(prev => [...prev, { id: fac._id, name: fac.name }]);
        setCurrentFacultyId('');
    };
    const removeFaculty = (id: string) => {
        setSelectedFaculty(prev => prev.filter(f => f.id !== id));
        setSubjectAssignments(prev => prev.filter(a => a.facultyId !== id));
    };

    // ── student handlers ──────────────────────────────────────────────────────
    const addStudent = () => {
        if (!currentStudentId || selectedStudentIds.includes(currentStudentId)) return;
        setSelectedStudentIds(prev => [...prev, currentStudentId]);
        setCurrentStudentId('');
    };
    const removeStudent = (id: string) => setSelectedStudentIds(prev => prev.filter(s => s !== id));

    // ── assignment handlers ───────────────────────────────────────────────────
    const addAssignment = () => {
        if (!assignSubjectId || !assignFacultyId) return;
        const subj = subjectById(assignSubjectId) ?? selectedSubjects.find(s => s.id === assignSubjectId);
        const fac = facultyById(assignFacultyId) ?? selectedFaculty.find(f => f.id === assignFacultyId);
        if (!subj || !fac) return;
        setSubjectAssignments(prev => [
            ...prev.filter(a => a.subjectId !== assignSubjectId),
            {
                subjectId: assignSubjectId,
                subjectName: (subj as any).name,
                subjectCode: (subj as any).code ?? '',
                facultyId: assignFacultyId,
                facultyName: (fac as any).name,
            },
        ]);
        setAssignSubjectId('');
        setAssignFacultyId('');
    };
    const removeAssignment = (subjectId: string) =>
        setSubjectAssignments(prev => prev.filter(a => a.subjectId !== subjectId));

    // ── submit ────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?id=${groupId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name,
                    year,
                    semester,
                    section,
                    termStartDate: termStartDate || null,
                    termEndDate: termEndDate || null,
                    // Send names for backward-compat subject/faculty resolution on server
                    subjects: selectedSubjects.map(s => s.name),
                    members: selectedFaculty.map(f => f.name),
                    students: selectedStudentIds,
                    subjectAssignments: subjectAssignments.map(a => ({
                        subject_id: a.subjectId,
                        faculty_id: a.facultyId,
                    })),
                }),
            });
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to update');
            }
            toast.success('Group Updated Successfully');
            router.push('/admin/faculty');
            router.refresh();
        } catch (error: any) {
            toast.error(error.message || 'Error updating group');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this group?')) return;
        setLoading(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?id=${groupId}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Failed to delete');
            toast.success('Group Deleted');
            router.push('/admin/faculty');
            router.refresh();
        } catch {
            toast.error('Error deleting group');
        } finally {
            setLoading(false);
        }
    };

    // ── render ────────────────────────────────────────────────────────────────
    return (
        <div className="max-w-2xl mx-auto py-12">
            <div className="mb-8">
                <Button variant="ghost" className="mb-4 pl-0" onClick={() => router.push('/admin/faculty')}>
                    <ArrowLeft className="w-4 h-4 mr-2" /> Back
                </Button>
                <SwissSubHeading className="text-primary tracking-widest uppercase">Configuration</SwissSubHeading>
                <SwissHeading className="text-3xl font-bold tracking-tight text-foreground">Edit Faculty Group</SwissHeading>
            </div>

            <Card className="border shadow-lg">
                <CardContent className="pt-6">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Name */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Group Name</label>
                            <input type="text" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={name} onChange={e => setName(e.target.value)} required />
                        </div>

                        {/* Year / Semester / Section */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground uppercase tracking-wider">Year</label>
                                <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={year} onChange={e => setYear(parseInt(e.target.value))}>
                                    {[1, 2, 3, 4].map(y => <option key={y} value={y}>Year {y}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground uppercase tracking-wider">Semester</label>
                                <select className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={semester} onChange={e => setSemester(parseInt(e.target.value))}>
                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(s => <option key={s} value={s}>Sem {s}</option>)}
                                </select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-foreground uppercase tracking-wider">Section</label>
                                <input type="text" maxLength={3} placeholder="A / B" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm uppercase" value={section} onChange={e => setSection(e.target.value.toUpperCase())} />
                            </div>
                        </div>

                        {/* Subjects */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-500" /> Assigned Subjects
                            </label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableSubjects.map(s => ({ value: s._id, label: `${s.name} (${s.code})` }))}
                                    value={currentSubjectId}
                                    onValueChange={setCurrentSubjectId}
                                    placeholder="Select Subject to Add"
                                    className="flex-1"
                                />
                                <Button type="button" variant="secondary" onClick={addSubject}><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {selectedSubjects.map((s, idx) => (
                                    <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal">
                                        {s.name}
                                        <button type="button" onClick={() => removeSubject(s.id)} className="hover:bg-primary/90 rounded-full p-0.5">
                                            <X className="w-3 h-3 text-white" />
                                        </button>
                                    </Badge>
                                ))}
                                {selectedSubjects.length === 0 && <span className="text-sm text-muted-foreground italic">No subjects assigned.</span>}
                            </div>
                        </div>

                        {/* Faculty */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" /> Associated Faculties
                            </label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableFaculties.map(f => ({ value: f._id, label: f.employeeId ? `${f.name} (#${f.employeeId})` : f.name }))}
                                    value={currentFacultyId}
                                    onValueChange={setCurrentFacultyId}
                                    placeholder="Select Faculty to Add"
                                    className="flex-1"
                                />
                                <Button type="button" variant="secondary" onClick={addFaculty}><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {selectedFaculty.map((f, idx) => (
                                    <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal bg-background border text-foreground">
                                        {f.name}
                                        <button type="button" onClick={() => removeFaculty(f.id)} className="hover:bg-primary/90 hover:text-white rounded-full p-0.5">
                                            <X className="w-3 h-3" />
                                        </button>
                                    </Badge>
                                ))}
                                {selectedFaculty.length === 0 && <span className="text-sm text-muted-foreground italic w-full text-center">No faculties assigned.</span>}
                            </div>
                        </div>

                        {/* Subject–Faculty Assignments */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                                <Link2 className="w-4 h-4 text-amber-500" /> Subject–Faculty Assignments
                            </label>
                            <p className="text-xs text-muted-foreground">Assign which faculty member teaches each subject.</p>
                            <div className="grid grid-cols-[1fr_1fr_auto] gap-2 items-end">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Subject</label>
                                    <SearchableSelect
                                        options={selectedSubjects.filter(s => s.id).map(s => ({ value: s.id, label: `${s.name}${s.code ? ` (${s.code})` : ''}` }))}
                                        value={assignSubjectId}
                                        onValueChange={setAssignSubjectId}
                                        placeholder="Pick subject..."
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Faculty</label>
                                    <SearchableSelect
                                        options={selectedFaculty.filter(f => f.id).map(f => ({ value: f.id, label: f.name }))}
                                        value={assignFacultyId}
                                        onValueChange={setAssignFacultyId}
                                        placeholder="Pick faculty..."
                                    />
                                </div>
                                <Button type="button" variant="secondary" onClick={addAssignment} className="self-end">
                                    <Plus className="w-4 h-4" />
                                </Button>
                            </div>
                            <div className="space-y-2 mt-2">
                                {subjectAssignments.length === 0 ? (
                                    <p className="text-xs text-muted-foreground italic p-3 border border-dashed rounded-md text-center">No assignments yet.</p>
                                ) : subjectAssignments.map(a => (
                                    <div key={a.subjectId} className="flex items-center justify-between px-3 py-2 bg-amber-50 border border-amber-100 rounded-lg">
                                        <div className="flex items-center gap-2 text-sm font-medium">
                                            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded text-xs font-bold">{a.subjectName}</span>
                                            <span className="text-muted-foreground">→</span>
                                            <span>{a.facultyName}</span>
                                        </div>
                                        <button type="button" onClick={() => removeAssignment(a.subjectId)} className="text-muted-foreground hover:text-destructive">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Students */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider flex items-center gap-2">
                                <GraduationCap className="w-4 h-4 text-violet-500" /> Associated Students
                            </label>
                            <div className="flex gap-2 mb-3">
                                <SearchableSelect
                                    options={availableStudents.map(s => ({
                                        value: s._id,
                                        label: s.enrollmentNumber ? `${s.name} (#${s.enrollmentNumber})` : `${s.name} (${s.email})`,
                                    }))}
                                    value={currentStudentId}
                                    onValueChange={setCurrentStudentId}
                                    placeholder="Select Student to Add"
                                    className="flex-1"
                                />
                                <Button type="button" variant="secondary" onClick={addStudent}><Plus className="w-4 h-4" /> Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 min-h-[40px] items-center p-4 bg-muted/20 border border-dashed rounded-md">
                                {selectedStudentIds.map((id, idx) => {
                                    const s = studentById(id);
                                    return (
                                        <Badge variant="default" key={idx} className="pl-3 pr-1 py-1 gap-2 text-sm font-normal bg-blue-100 text-blue-900 border border-blue-200">
                                            {s ? (s.enrollmentNumber ? `${s.name} #${s.enrollmentNumber}` : s.name) : id}
                                            <button type="button" onClick={() => removeStudent(id)} className="hover:bg-blue-600 hover:text-white rounded-full p-0.5">
                                                <X className="w-3 h-3" />
                                            </button>
                                        </Badge>
                                    );
                                })}
                                {selectedStudentIds.length === 0 && <span className="text-sm text-muted-foreground italic w-full text-center">No students assigned.</span>}
                            </div>
                        </div>

                        {/* Term Dates */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-foreground uppercase tracking-wider">Academic Term Duration</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Term Start</label>
                                    <input type="date" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={termStartDate} onChange={e => setTermStartDate(e.target.value)} />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs text-muted-foreground">Term End</label>
                                    <input type="date" className="w-full bg-background border border-input rounded-md px-3 py-2 text-sm" value={termEndDate} onChange={e => setTermEndDate(e.target.value)} />
                                </div>
                            </div>
                            <p className="text-xs text-muted-foreground">Defines the validity period for this group's schedule.</p>
                        </div>

                        {/* Actions */}
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
