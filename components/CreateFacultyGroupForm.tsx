'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createFacultyGroup } from '@/app/actions/faculty';
import { Card, CardContent, CardHeader, CardTitle, Button } from '@/components/ui/SwissUI';
import { Loader2, X, Plus, ArrowRight, BookOpen, Users, GraduationCap, Building2, Info, Link2, Calendar } from 'lucide-react';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { SearchableMultiSelect } from '@/components/ui/searchable-multi-select';
import { toast } from 'sonner';

interface Department { _id: string; name: string; code?: string; }

interface SubjectAssignment {
    subjectId: string;
    subjectName: string;
    facultyId: string;
    facultyName: string;
}

interface AvailableSubject { _id: string; name: string; code: string; }
interface AvailableFaculty { _id: string; name: string; email: string; employeeId?: string; }
interface AvailableStudent { _id: string; name: string; email: string; enrollmentNumber?: string; }

export default function CreateFacultyGroupForm() {
    const router = useRouter();

    const [name, setName] = useState('');
    const [year, setYear] = useState(1);
    const [semester, setSemester] = useState(1);
    const [termStartDate, setTermStartDate] = useState('');
    const [termEndDate, setTermEndDate] = useState('');
    const [departmentId, setDepartmentId] = useState('');
    const [viewer, setViewer] = useState<{ role: string; department_id?: string; department_name?: string } | null>(null);

    const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>([]);
    const [currentSubjectId, setCurrentSubjectId] = useState('');

    const [selectedFacultyNames, setSelectedFacultyNames] = useState<string[]>([]);
    const [currentFacultyName, setCurrentFacultyName] = useState('');

    const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
    const [currentStudentId, setCurrentStudentId] = useState('');

    const [subjectAssignments, setSubjectAssignments] = useState<SubjectAssignment[]>([]);
    const [assignSubjectId, setAssignSubjectId] = useState('');
    const [assignFacultyIds, setAssignFacultyIds] = useState<string[]>([]);

    const [availableSubjects, setAvailableSubjects] = useState<AvailableSubject[]>([]);
    const [availableFaculties, setAvailableFaculties] = useState<AvailableFaculty[]>([]);
    const [availableStudents, setAvailableStudents] = useState<AvailableStudent[]>([]);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const [resMe, resSub, resFac, resStud, resDept] = await Promise.all([
                    fetch('/api/user/me'),
                    fetch('/api/admin/subjects'),
                    fetch('/api/admin/users/list?role=FACULTY'),
                    fetch('/api/admin/users/list?role=STUDENT'),
                    fetch('/api/admin/departments'),
                ]);
                const [dataMe, dataSub, dataFac, dataStud, dataDept] = await Promise.all([
                    resMe.json(), resSub.json(), resFac.json(), resStud.json(), resDept.json(),
                ]);

                if (dataMe.success) {
                    setViewer(dataMe.user);
                    if (dataMe.user.role === 'HOD' && dataMe.user.department_id) {
                        setDepartmentId(dataMe.user.department_id);
                    }
                }

                if (dataSub.success) setAvailableSubjects(dataSub.subjects);
                if (dataFac.success) setAvailableFaculties(dataFac.users);
                if (dataStud.success) setAvailableStudents(dataStud.users);
                if (Array.isArray(dataDept)) setDepartments(dataDept);
            } catch (err) {
                console.error('Failed to load resources', err);
            }
        };
        load();
    }, []);

    const subjectById = (id: string) => availableSubjects.find(s => s._id === id);
    const facultyById = (id: string) => availableFaculties.find(f => f._id === id);
    const studentById = (id: string) => availableStudents.find(s => s._id === id);

    const addSubject = () => {
        if (!currentSubjectId || selectedSubjectIds.includes(currentSubjectId)) return;
        setSelectedSubjectIds(prev => [...prev, currentSubjectId]);
        setCurrentSubjectId('');
    };
    const removeSubject = (id: string) => {
        setSelectedSubjectIds(prev => prev.filter(s => s !== id));
        setSubjectAssignments(prev => prev.filter(a => a.subjectId !== id));
    };

    const addFaculty = () => {
        if (!currentFacultyName || selectedFacultyNames.includes(currentFacultyName)) return;
        setSelectedFacultyNames(prev => [...prev, currentFacultyName]);
        setCurrentFacultyName('');
    };
    const removeFaculty = (fname: string) => {
        setSelectedFacultyNames(prev => prev.filter(f => f !== fname));
        setSubjectAssignments(prev => prev.filter(a => a.facultyName !== fname));
    };

    const addStudent = () => {
        if (!currentStudentId || selectedStudentIds.includes(currentStudentId)) return;
        setSelectedStudentIds(prev => [...prev, currentStudentId]);
        setCurrentStudentId('');
    };
    const removeStudent = (id: string) => setSelectedStudentIds(prev => prev.filter(s => s !== id));

    const addAssignment = () => {
        if (!assignSubjectId || assignFacultyIds.length === 0) return;
        const subj = subjectById(assignSubjectId);
        if (!subj) return;

        const newAssignments: SubjectAssignment[] = [];
        let dupCount = 0;

        assignFacultyIds.forEach(fid => {
            const fac = facultyById(fid);
            if (!fac) return;

            const isDup = subjectAssignments.some(a => a.subjectId === assignSubjectId && a.facultyId === fid);
            if (isDup) {
                dupCount++;
                return;
            }

            newAssignments.push({
                subjectId: assignSubjectId,
                subjectName: subj.name,
                facultyId: fid,
                facultyName: fac.name
            });
        });

        if (newAssignments.length > 0) {
            setSubjectAssignments(prev => [...prev, ...newAssignments]);
            
            // Auto-sync with Pool
            setSelectedSubjectIds(prev => Array.from(new Set([...prev, assignSubjectId])));
            const selectedFnames = newAssignments.map(a => a.facultyName);
            setSelectedFacultyNames(prev => Array.from(new Set([...prev, ...selectedFnames])));

            setAssignSubjectId('');
            setAssignFacultyIds([]);
            if (dupCount > 0) {
                toast.info("Assignments Partial", { description: `Added ${newAssignments.length} new, ${dupCount} already existed.` });
            }
        } else if (dupCount > 0) {
            toast.error("Duplicate Assignments", { description: "All selected faculty are already assigned to this subject." });
        }
    };
    const removeAssignment = (subjectId: string, facultyId: string) =>
        setSubjectAssignments(prev => prev.filter(a => !(a.subjectId === subjectId && a.facultyId === facultyId)));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) {
            toast.error('Group Name Missing', { description: 'Please provide a name for this group.' });
            return;
        }
        if (selectedSubjectIds.length === 0) {
            toast.error('No Subjects', { description: 'Please add at least one subject.' });
            return;
        }
        const subjectNames = selectedSubjectIds.map(id => subjectById(id)?.name ?? '').filter(Boolean);
        setLoading(true);
        const result = await createFacultyGroup({
            name,
            department_id: departmentId || undefined,
            subjects: subjectNames,
            members: selectedFacultyNames,
            students: selectedStudentIds,
            subjectAssignments: subjectAssignments.map(a => ({
                subject_id: a.subjectId,
                faculty_id: a.facultyId,
            })),
            year,
            semester,
            section: undefined, // Explicitly removed
            termStartDate: termStartDate || undefined,
            termEndDate: termEndDate || undefined,
        });
        if (result.success) {
            toast.success('Faculty Group Created', { description: `${name} has been saved successfully.` });
            router.push('/admin/faculty');
            router.refresh();
        } else {
            toast.error('Operation Failed', { description: result.error || 'Check administrative logs.' });
        }
        setLoading(false);
    };

    return (
        <div className="w-full space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="space-y-2 border-l-4 border-primary pl-6 py-2">
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary">Group Configuration</p>
                <h2 className="text-4xl font-black tracking-tighter text-[#0A1128] uppercase">New Faculty Group</h2>
                <p className="text-slate-500 font-medium text-sm max-w-xl">
                    Create a new class group and assign subjects, faculty, and students.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Group Details */}
                <Card className="rounded-[32px] border border-slate-100 shadow-xl bg-white overflow-hidden">
                    <CardHeader className="p-8 pb-4 bg-slate-50/50 border-b border-slate-50">
                        <div className="flex items-center gap-3">
                            <Building2 className="w-5 h-5 text-primary" />
                            <CardTitle className="text-xl font-black uppercase tracking-tight text-[#0A1128]">Group Details</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-8 pt-6 space-y-4">
                        {/* Department - Visible for Principal, Hidden/Locked for HOD */}
                        {viewer?.role === 'PRINCIPAL' ? (
                            departments.length > 0 && (
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Department</label>
                                    <select
                                        className="w-full h-11 bg-slate-50 border border-slate-100 rounded-xl px-4 text-sm font-black text-[#0A1128] focus:ring-2 focus:ring-primary/20 outline-none"
                                        value={departmentId}
                                        onChange={e => setDepartmentId(e.target.value)}
                                        required
                                    >
                                        <option value="">— Select Department —</option>
                                        {departments.map(d => (
                                            <option key={d._id} value={d._id}>{d.name}{d.code ? ` (${d.code})` : ''}</option>
                                        ))}
                                    </select>
                                </div>
                            )
                        ) : viewer?.role === 'HOD' ? (
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Locked Department</label>
                                <div className="w-full h-11 bg-slate-100 border border-slate-200 rounded-xl px-4 flex items-center text-sm font-black text-slate-500 overflow-hidden truncate">
                                    {viewer.department_name || viewer.department || 'Your Department'} (HOD Locked)
                                </div>
                                <input type="hidden" value={departmentId} />
                            </div>
                        ) : null}
                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Class Designation (e.g. 6CSE-B)</label>
                            <input
                                type="text"
                                placeholder="Enter Group Name..."
                                className="w-full h-14 bg-slate-50 border border-slate-100 rounded-2xl px-6 text-xl font-black tracking-tight text-[#0A1128] focus:ring-4 focus:ring-primary/5 focus:border-primary outline-none transition-all placeholder:text-slate-300"
                                value={name}
                                onChange={e => setName(e.target.value)}
                                required
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Year</label>
                                <SearchableSelect
                                    options={[1, 2, 3, 4].map(y => ({ value: y.toString(), label: `Year ${y}` }))}
                                    value={year.toString()}
                                    onValueChange={v => setYear(parseInt(v))}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-100 font-black text-[#0A1128]"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Semester</label>
                                <SearchableSelect
                                    options={[1, 2, 3, 4, 5, 6, 7, 8].map(s => ({ value: s.toString(), label: `Semester ${s}` }))}
                                    value={semester.toString()}
                                    onValueChange={v => setSemester(parseInt(v))}
                                    className="h-11 rounded-xl bg-slate-50 border-slate-100 font-black text-[#0A1128]"
                                />
                            </div>
                        </div>
                        <div className="flex items-start gap-2 p-4 bg-blue-50/50 rounded-2xl border border-blue-100 mb-6">
                            <Info className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest leading-relaxed">Year + Semester are used for dashboard analytics and academic segregation.</p>
                        </div>

                        {/* Term Planning Section */}
                        <div className="pt-6 border-t border-slate-100/60 space-y-5">                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <h3 className="text-sm font-black uppercase tracking-tight text-[#0A1128]">Term Planning</h3>
                                </div>
                                <div className="px-2.5 py-1 bg-amber-50 text-amber-600 border border-amber-500/20 rounded-lg flex items-center gap-1.5 animate-pulse">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                    <span className="text-[8px] font-black uppercase tracking-widest">Required for AI</span>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic Start</label>
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 text-sm font-black text-[#0A1128] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                        value={termStartDate}
                                        onChange={e => setTermStartDate(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Academic End</label>
                                    <input
                                        type="date"
                                        className="w-full h-12 bg-slate-50 border border-slate-100 rounded-xl px-5 text-sm font-black text-[#0A1128] outline-none focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all"
                                        value={termEndDate}
                                        onChange={e => setTermEndDate(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subjects & Faculty */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <Card className="rounded-[32px] border border-slate-100 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="p-6 pb-2 bg-emerald-50/10 border-b border-emerald-50/20">
                            <div className="flex items-center gap-2">
                                <BookOpen className="w-4 h-4 text-emerald-500" />
                                <CardTitle className="text-lg font-black uppercase tracking-tight text-[#0A1128]">Subjects</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <SearchableSelect
                                        options={availableSubjects.map(s => ({ value: s._id, label: `${s.name} (${s.code})` }))}
                                        value={currentSubjectId}
                                        onValueChange={setCurrentSubjectId}
                                        placeholder="Select Subject..."
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <Button type="button" size="icon" onClick={addSubject} className="h-11 w-11 shrink-0 rounded-xl bg-emerald-500 text-white hover:bg-emerald-600 shadow-lg shadow-emerald-500/20">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[120px] flex flex-wrap gap-2 content-start">
                                {selectedSubjectIds.length === 0 ? (
                                    <p className="w-full text-center py-8 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">No Subjects Added</p>
                                ) : selectedSubjectIds.map(id => {
                                    const s = subjectById(id);
                                    return (
                                        <div key={id} className="flex items-center gap-2 bg-[#0A1128] text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {s ? s.name : id}
                                            <X className="w-3 h-3 hover:text-emerald-400 cursor-pointer" onClick={() => removeSubject(id)} />
                                        </div>
                                    );
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="rounded-[32px] border border-slate-100 shadow-lg bg-white overflow-hidden">
                        <CardHeader className="p-6 pb-2 bg-blue-50/10 border-b border-blue-50/20">
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4 text-blue-500" />
                                <CardTitle className="text-lg font-black uppercase tracking-tight text-[#0A1128]">Faculty Members</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <div className="flex items-center gap-2">
                                <div className="flex-1">
                                    <SearchableSelect
                                        options={availableFaculties.map(f => ({ value: f.name, label: f.employeeId ? `${f.name} (#${f.employeeId})` : f.name }))}
                                        value={currentFacultyName}
                                        onValueChange={setCurrentFacultyName}
                                        placeholder="Select Faculty..."
                                        className="h-11 rounded-xl"
                                    />
                                </div>
                                <Button type="button" size="icon" onClick={addFaculty} className="h-11 w-11 shrink-0 rounded-xl bg-blue-500 text-white hover:bg-blue-600 shadow-lg shadow-blue-500/20">
                                    <Plus className="w-5 h-5" />
                                </Button>
                            </div>
                            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[120px] flex flex-wrap gap-2 content-start">
                                {selectedFacultyNames.length === 0 ? (
                                    <p className="w-full text-center py-8 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">No Faculty Assigned</p>
                                ) : selectedFacultyNames.map((fname, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-white border border-slate-200 text-[#0A1128] px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest shadow-sm">
                                        {fname}
                                        <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" onClick={() => removeFaculty(fname)} />
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Subject → Faculty Assignments */}
                <Card className="rounded-[32px] border border-slate-100 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="p-6 pb-2 bg-amber-50/20 border-b border-amber-50/30">
                        <div className="flex items-center gap-2">
                            <Link2 className="w-4 h-4 text-amber-500" />
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-[#0A1128]">Subject–Faculty Assignments</CardTitle>
                        </div>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
                            Assign which faculty member teaches each subject in this group.
                        </p>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex items-end gap-2">
                            <div className="flex-1 space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</label>
                                <SearchableSelect
                                    options={availableSubjects.map(s => ({ value: s._id, label: `${s.name} (${s.code})` }))}
                                    value={assignSubjectId}
                                    onValueChange={setAssignSubjectId}
                                    placeholder="Pick subject..."
                                    className="h-11 rounded-xl"
                                />
                            </div>
                            <div className="flex-[1.5] space-y-1">
                                <label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Faculty</label>
                                <SearchableMultiSelect
                                    options={availableFaculties.map(f => ({ value: f._id, label: f.name }))}
                                    value={assignFacultyIds}
                                    onValueChange={setAssignFacultyIds}
                                    placeholder="Pick faculty members..."
                                    className="rounded-xl"
                                />
                            </div>
                            <Button type="button" variant="orange" size="icon" onClick={addAssignment} className="h-11 w-11 shrink-0 shadow-orange-500/20 translate-y-[-1px]">
                                <Plus className="w-5 h-5" />
                            </Button>
                        </div>
                        {subjectAssignments.length === 0 ? (
                            <p className="text-center py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                                No assignments yet — add subjects and faculty first.
                            </p>
                        ) : (
                            <div className="space-y-2">
                                {subjectAssignments.map(a => (
                                    <div key={`${a.subjectId}-${a.facultyId}`} className="flex items-center justify-between px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                                        <div className="flex items-center gap-3 text-sm font-bold text-[#0A1128]">
                                            <span className="bg-amber-200 text-amber-900 px-2 py-0.5 rounded-md text-[9px] uppercase tracking-widest font-black">{a.subjectName}</span>
                                            <span className="text-slate-400">→</span>
                                            <span>{a.facultyName}</span>
                                        </div>
                                        <button type="button" onClick={() => removeAssignment(a.subjectId, a.facultyId)} className="text-slate-400 hover:text-rose-500 transition-colors">
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Students */}
                <Card className="rounded-[32px] border border-slate-100 shadow-lg bg-white overflow-hidden">
                    <CardHeader className="p-6 pb-2 bg-violet-50/10 border-b border-violet-50/20">
                        <div className="flex items-center gap-2">
                            <GraduationCap className="w-4 h-4 text-violet-500" />
                            <CardTitle className="text-lg font-black uppercase tracking-tight text-[#0A1128]">
                                Students <span className="text-slate-400 font-medium normal-case text-sm">(Optional)</span>
                            </CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6 space-y-4">
                        <div className="flex gap-2">
                            <SearchableSelect
                                options={availableStudents.map(s => ({
                                    value: s._id,
                                    label: s.enrollmentNumber ? `${s.name} (#${s.enrollmentNumber})` : `${s.name} (${s.email})`,
                                }))}
                                value={currentStudentId}
                                onValueChange={setCurrentStudentId}
                                placeholder="Search students..."
                                className="h-11 rounded-xl flex-1"
                            />
                            <Button type="button" size="icon" onClick={addStudent} className="h-11 w-11 rounded-xl bg-violet-500 text-white hover:bg-violet-600">
                                <Plus className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                        <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 min-h-[80px] flex flex-wrap gap-2 content-start">
                            {selectedStudentIds.length === 0 ? (
                                <p className="w-full text-center py-4 text-[9px] font-black text-slate-300 uppercase tracking-widest italic">No Students Added</p>
                            ) : selectedStudentIds.map(id => {
                                const s = studentById(id);
                                return (
                                    <div key={id} className="flex items-center gap-2 bg-violet-50 text-violet-600 border border-violet-100 px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                        {s ? (s.enrollmentNumber ? `${s.name} #${s.enrollmentNumber}` : s.name) : id}
                                        <X className="w-3 h-3 hover:text-rose-500 cursor-pointer" onClick={() => removeStudent(id)} />
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>

                {/* Submit */}
                <div className="pt-6">
                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-20 rounded-[24px] bg-[#0A1128] hover:bg-[#0A1128]/90 text-white font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl shadow-slate-900/20 group transition-all active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="h-5 w-5 animate-spin" /> Saving Group...
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                Create Faculty Group
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform" />
                            </div>
                        )}
                    </Button>
                </div>
            </form>
        </div>
    );
}
