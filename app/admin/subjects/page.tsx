'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
    Search,
    Plus,
    BookOpen,
    Trash2,
    Edit3,
    Loader2,
    Book,
    FileUp,
    FileDown,
    GraduationCap,
    Hash,
    Building2,
    Layers,
    X
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SearchableSelect } from '@/components/ui/searchable-select';
import { cn } from '@/lib/utils';



export default function SubjectRegistry() {
    const [isLoading, setIsLoading] = useState(false);
    const [subjects, setSubjects] = useState<any[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form State
    const [formData, setFormData] = useState({
        _id: '',
        name: '',
        code: '',
        department: '',
        year: '',
        semester: '',
        syllabus: '' // Base64 or filename
    });
    const [dbDepartments, setDbDepartments] = useState<any[]>([]);

    useEffect(() => {
        fetchSubjects();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            const data = await res.json();
            if (Array.isArray(data)) setDbDepartments(data);
        } catch (error) {
            console.error("Failed to fetch departments", error);
        }
    };

    const fetchSubjects = async () => {
        try {
            const res = await fetch('/api/admin/subjects');
            const data = await res.json();
            if (data.success) {
                setSubjects(data.subjects);
            }
        } catch (error) {
            console.error("Failed to fetch subjects", error);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            toast.error("File excessively large", { description: "Curriculum documentation must be under 2MB." });
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64 = event.target?.result as string;
            setFormData({ ...formData, syllabus: base64 });
            toast.success("Syllabus encoded", { description: `${file.name} ready for registry.` });
        };
        reader.readAsDataURL(file);
    };

    const handleDownloadSyllabus = (sub: any) => {
        if (!sub.syllabus) {
            toast.error("No documentation found", { description: "This curricula node lacks a digital syllabus." });
            return;
        }

        const link = document.createElement('a');
        link.href = sub.syllabus;
        link.download = `Syllabus_${sub.code}_${sub.name.replace(/\s+/g, '_')}.pdf`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const res = await fetch('/api/admin/subjects', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(isEditing ? { ...formData, id: formData._id } : { ...formData, _id: undefined })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Operation failed");

            toast.success(isEditing ? "Curriculum revised" : "New subject registered");
            setFormData({ _id: '', name: '', code: '', department: '', year: '', semester: '', syllabus: '' });
            setIsEditing(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
            fetchSubjects();
        } catch (err: any) {
            toast.error("Registry error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this subject?")) return;
        try {
            const res = await fetch(`/api/admin/subjects?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Deletion failed");
            toast.success("Subject deleted");
            fetchSubjects();
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        }
    };

    const handleEdit = (sub: any) => {
        setFormData({
            _id: sub._id,
            name: sub.name,
            code: sub.code,
            department: sub.department || '',
            year: sub.year || '',
            semester: sub.semester || '',
            syllabus: sub.syllabus || ''
        });
        setIsEditing(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const filteredSubjects = subjects
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(s =>
            s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.code.toLowerCase().includes(searchQuery.toLowerCase())
        );

    return (        <DashboardLayout role="Admin">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/40 pb-6">
                    <div>
                        <h1 className="text-3xl font-black text-[#0A1128] tracking-tight uppercase">Curriculum Registry</h1>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em] mt-1 italic">Institutional Knowledge Base & Syllabus Matrix</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Add/Edit Form */}
                    <div className="lg:col-span-4 lg:sticky lg:top-6 self-start">
                        <Card className="shadow-2xl border-none rounded-[32px] overflow-hidden bg-white">
                            <CardHeader className="pb-8 border-b border-slate-50 bg-slate-50/30">
                                <CardTitle className="text-xl font-black tracking-tight text-[#0A1128] uppercase flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-primary" />
                                    {isEditing ? 'Curriculum Revision' : 'Catalog New Course'}
                                </CardTitle>
                                <CardDescription className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Define academic credits and identification</CardDescription>
                            </CardHeader>
                            <CardContent className="pt-8 p-8">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Official Subject Name</label>
                                        <div className="relative">
                                            <Input
                                                placeholder="e.g. Advanced Data Structures"
                                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold pl-10 focus:ring-4 focus:ring-primary/5 transition-all"
                                                value={formData.name}
                                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                                required
                                            />
                                            <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Descriptor Code</label>
                                            <div className="relative">
                                                <Input
                                                    placeholder="CS-301"
                                                    className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold uppercase pl-10"
                                                    value={formData.code}
                                                    onChange={e => setFormData({ ...formData, code: e.target.value })}
                                                    required
                                                />
                                                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Department</label>
                                            <SearchableSelect
                                                options={dbDepartments.map(d => ({ value: d.name, label: d.name }))}
                                                value={formData.department}
                                                onValueChange={(val) => setFormData({ ...formData, department: val })}
                                                placeholder="Select Dept"
                                                className="h-12 rounded-xl bg-slate-50 border-slate-200 font-bold"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Academic Year</label>
                                            <Input
                                                placeholder="3"
                                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold"
                                                value={formData.year}
                                                onChange={e => setFormData({ ...formData, year: e.target.value })}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Semester</label>
                                            <Input
                                                placeholder="5"
                                                className="h-12 bg-slate-50 border-slate-200 rounded-xl font-bold"
                                                value={formData.semester}
                                                onChange={e => setFormData({ ...formData, semester: e.target.value })}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Syllabus / Curricula Data</label>
                                        <div className="flex items-center gap-3">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                className="hidden"
                                                accept=".pdf"
                                                onChange={handleFileChange}
                                            />
                                            <Button
                                                type="button"
                                                variant="outline"
                                                className={cn(
                                                    "h-14 flex-1 rounded-2xl border-dashed border-2 font-black text-[10px] uppercase tracking-widest gap-3 transition-all",
                                                    formData.syllabus ? "bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100" : "bg-slate-50 border-slate-200 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                                                )}
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                {formData.syllabus ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <FileUp className="w-5 h-5" />}
                                                {formData.syllabus ? "Documentation Encoded" : "Upload Syllabus PDF"}
                                            </Button>
                                            {formData.syllabus && (
                                                <Button
                                                    type="button"
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-14 w-14 rounded-2xl bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50"
                                                    onClick={() => {
                                                        setFormData({ ...formData, syllabus: '' });
                                                        if (fileInputRef.current) fileInputRef.current.value = '';
                                                    }}
                                                >
                                                    <X className="w-5 h-5" />
                                                </Button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="pt-4 flex flex-col gap-3">
                                        <Button className="w-full h-16 rounded-[24px] bg-[#2563eb] hover:bg-[#1d4ed8] text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-xl shadow-blue-600/20" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="animate-spin mr-3 h-5 w-5" /> : isEditing ? 'Commit Revision' : 'Registry Entry'}
                                        </Button>
                                        {isEditing && (
                                            <Button
                                                variant="ghost"
                                                className="h-12 rounded-xl text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0A1128] hover:bg-slate-50"
                                                onClick={() => { setIsEditing(false); setFormData({ _id: '', name: '', code: '', department: '', year: '', semester: '', syllabus: '' }); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                                            >
                                                Abort Revision
                                            </Button>
                                        )}
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Subjects Grid */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="flex items-center gap-4 bg-white p-2 rounded-[24px] shadow-xl border border-slate-100">
                            <div className="relative flex-1">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 opacity-50" />
                                <input
                                    placeholder="Search curriculum by nomenclature or descriptor code..."
                                    className="w-full pl-12 h-14 text-sm font-bold bg-transparent outline-none border-none placeholder:text-slate-300"
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-6">
                            {filteredSubjects.length === 0 ? (
                                <div className="col-span-full py-32 text-center space-y-6 border-2 border-dashed border-slate-200 rounded-[48px] bg-slate-50/30">
                                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto shadow-xl border border-slate-100">
                                        <Book className="w-10 h-10 text-slate-200" />
                                    </div>
                                    <p className="text-[11px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Repository holds no matching curriculum.</p>
                                </div>
                            ) : (
                                filteredSubjects.map((sub) => (
                                    <Card key={sub._id} className="hover:shadow-3xl hover:border-primary/5 transition-all duration-500 group overflow-hidden bg-white border-none rounded-[32px] shadow-xl flex flex-col justify-between">
                                        <CardContent className="p-8 flex-1 flex flex-col justify-between">
                                            <div className="space-y-4">
                                                <div className="flex justify-between items-start">
                                                    <div className="flex flex-col gap-1">
                                                        <span className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">{sub.code}</span>
                                                        <div className="flex gap-2">
                                                            <Badge variant="secondary" className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border-none shadow-sm">{sub.department}</Badge>
                                                            {sub.year && <Badge variant="outline" className="px-2.5 py-1 text-[8px] font-black uppercase tracking-widest border-slate-100 text-slate-400 font-bold">L: YR{sub.year}</Badge>}
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-1.5 translate-x-2 -translate-y-2 opacity-0 group-hover:opacity-100 transition-all duration-300">
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-primary hover:bg-primary/5 rounded-xl transition-all" onClick={() => handleEdit(sub)}>
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-9 w-9 text-slate-300 hover:text-destructive hover:bg-destructive/5 rounded-xl transition-all" onClick={() => handleDelete(sub._id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                </div>
                                                <h4 className="font-black text-[#0A1128] text-xl leading-tight line-clamp-2 uppercase tracking-tight group-hover:text-primary transition-colors pr-4">{sub.name}</h4>
                                            </div>

                                            <div className="flex items-center justify-between pt-8 mt-auto border-t border-slate-50">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center">
                                                        <Layers className="w-4 h-4 text-slate-400" />
                                                    </div>
                                                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                        {(sub.semester !== undefined && sub.semester !== null && sub.semester !== '') ? `Sem ${sub.semester}` : 'Sem N/A'}
                                                    </span>
                                                </div>

                                                {sub.syllabus ? (
                                                    <Button
                                                        variant="outline"
                                                        className="h-10 px-4 rounded-xl border-[#2563eb]/10 text-[#2563eb] bg-blue-50/30 hover:bg-[#2563eb] hover:text-white text-[9px] font-black uppercase tracking-widest transition-all"
                                                        onClick={() => handleDownloadSyllabus(sub)}
                                                    >
                                                        <FileDown className="w-4 h-4 mr-2" />
                                                        Download Syllabus
                                                    </Button>
                                                ) : (
                                                    <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest italic mr-2">No Doc Linked</span>
                                                )}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}

const CheckCircle2 = (props: any) => (
    <svg
        {...props}
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
        <path d="m9 12 2 2 4-4" />
    </svg>
);
