'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus, Building2, Loader2, Trash2, X, Pencil, Check,
    Users, Layers, GraduationCap
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

interface Department {
    _id: string;
    name: string;
    code?: string;
    hod_id?: { _id: string; name: string; email: string } | null;
    groupCount?: number;
}

const EMPTY_FORM = { name: '', code: '' };

export default function DepartmentManager({ initialDepartments = [] }: { initialDepartments?: any[] }) {
    const router = useRouter();
    const [departments, setDepartments] = useState<Department[]>(initialDepartments);
    const [form, setForm] = useState(EMPTY_FORM);
    const [isAdding, setIsAdding] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState(EMPTY_FORM);
    const [loadingId, setLoadingId] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // ── CREATE ────────────────────────────────────────────────────────────────
    const handleAdd = async () => {
        if (!form.name.trim()) return toast.error("Department name is required");
        setIsSubmitting(true);
        try {
            const res = await fetch('/api/admin/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add department");
            setDepartments(prev => [...prev, data]);
            setForm(EMPTY_FORM);
            setIsAdding(false);
            toast.success(`Department "${data.name}" added`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    // ── UPDATE ────────────────────────────────────────────────────────────────
    const handleUpdate = async (id: string) => {
        if (!editForm.name.trim()) return toast.error("Name is required");
        setLoadingId(id);
        try {
            const res = await fetch('/api/admin/departments', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id, name: editForm.name, code: editForm.code })
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");
            setDepartments(prev => prev.map(d => d._id === id ? { ...d, ...data } : d));
            setEditingId(null);
            toast.success("Department updated");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    // ── DELETE ────────────────────────────────────────────────────────────────
    const handleDelete = async (dept: Department) => {
        if (!confirm(`Delete "${dept.name}"? This cannot be undone.`)) return;
        setLoadingId(dept._id);
        try {
            const res = await fetch(`/api/admin/departments?id=${dept._id}`, { method: 'DELETE' });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Delete failed");
            setDepartments(prev => prev.filter(d => d._id !== dept._id));
            toast.success(`"${dept.name}" deleted`);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setLoadingId(null);
        }
    };

    const startEdit = (dept: Department) => {
        setEditingId(dept._id);
        setEditForm({ name: dept.name, code: dept.code || '' });
        setIsAdding(false);
    };

    return (
        <Card className="shadow-sm border-border overflow-hidden rounded-3xl transition-all hover:shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between pb-4">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Department Registry</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">
                        Manage institutional units · {departments.length} registered
                    </CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                    onClick={() => { setIsAdding(!isAdding); setEditingId(null); }}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </CardHeader>

            <CardContent className="space-y-4">
                {/* ── Add Form ── */}
                {isAdding && (
                    <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-primary/30 animate-in slide-in-from-top-2 duration-300">
                        <p className="text-[10px] font-black uppercase tracking-widest text-primary mb-3">New Department</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                            <div className="sm:col-span-2">
                                <Input
                                    placeholder="Department Name (e.g. Computer Science)"
                                    value={form.name}
                                    onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="h-9 text-xs"
                                    onKeyDown={e => e.key === 'Enter' && handleAdd()}
                                />
                            </div>
                            <Input
                                placeholder="Code (e.g. CSE)"
                                value={form.code}
                                onChange={e => setForm({ ...form, code: e.target.value })}
                                className="h-9 text-xs uppercase"
                                maxLength={6}
                            />
                        </div>
                        <div className="flex gap-2 mt-3">
                            <Button
                                size="sm"
                                className="flex-1 text-[9px] font-black uppercase tracking-widest h-9"
                                onClick={handleAdd}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : <Plus className="w-3 h-3 mr-1" />}
                                Add Department
                            </Button>
                            <Button size="sm" variant="ghost" className="h-9 text-xs" onClick={() => setIsAdding(false)}>
                                Cancel
                            </Button>
                        </div>
                    </div>
                )}

                {/* ── Department List ── */}
                <div className="space-y-2">
                    {departments.length === 0 ? (
                        <div className="text-center py-10 space-y-2">
                            <Building2 className="w-10 h-10 mx-auto text-muted-foreground/20" />
                            <p className="text-xs font-medium text-muted-foreground italic">No departments registered.</p>
                            <p className="text-[10px] text-muted-foreground">Click the + button to add your first department.</p>
                        </div>
                    ) : (
                        departments.map((dept) => (
                            <div key={dept._id} className={cn(
                                "rounded-2xl border transition-all",
                                editingId === dept._id
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-transparent hover:border-border/60 hover:bg-muted/30"
                            )}>
                                {editingId === dept._id ? (
                                    /* ── Inline Edit Row ── */
                                    <div className="p-3 space-y-3">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-primary">Editing</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                            <div className="sm:col-span-2">
                                                <Input
                                                    value={editForm.name}
                                                    onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                                    className="h-8 text-xs"
                                                    placeholder="Department name"
                                                    onKeyDown={e => e.key === 'Enter' && handleUpdate(dept._id)}
                                                />
                                            </div>
                                            <Input
                                                value={editForm.code}
                                                onChange={e => setEditForm({ ...editForm, code: e.target.value })}
                                                className="h-8 text-xs uppercase"
                                                placeholder="Code"
                                                maxLength={6}
                                            />
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                className="h-8 text-[9px] font-black uppercase gap-1"
                                                onClick={() => handleUpdate(dept._id)}
                                                disabled={loadingId === dept._id}
                                            >
                                                {loadingId === dept._id
                                                    ? <Loader2 className="w-3 h-3 animate-spin" />
                                                    : <Check className="w-3 h-3" />}
                                                Save
                                            </Button>
                                            <Button size="sm" variant="ghost" className="h-8 text-xs"
                                                onClick={() => setEditingId(null)}>Cancel</Button>
                                        </div>
                                    </div>
                                ) : (
                                    /* ── Display Row ── */
                                    <div className="flex items-center justify-between p-3 group/item">
                                        <div className="flex items-center gap-3 min-w-0">
                                            <div className="w-9 h-9 rounded-xl bg-muted group-hover/item:bg-primary/10 group-hover/item:text-primary flex items-center justify-center transition-colors shrink-0">
                                                <Building2 className="w-4 h-4" />
                                            </div>
                                            <div className="min-w-0">
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    <p className="text-sm font-bold text-foreground leading-tight">{dept.name}</p>
                                                    {dept.code && (
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase tracking-widest px-1.5 py-0">
                                                            {dept.code}
                                                        </Badge>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-3 mt-0.5">
                                                    {dept.hod_id ? (
                                                        <span className="text-[9px] text-muted-foreground font-bold flex items-center gap-1">
                                                            <GraduationCap className="w-2.5 h-2.5" />
                                                            HOD: {dept.hod_id.name}
                                                        </span>
                                                    ) : (
                                                        <span className="text-[9px] text-amber-500 font-black flex items-center gap-1">
                                                            <GraduationCap className="w-2.5 h-2.5" />
                                                            No HOD assigned
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1 opacity-0 group-hover/item:opacity-100 transition-all shrink-0 ml-3">
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg"
                                                onClick={() => startEdit(dept)}
                                                title="Edit department"
                                            >
                                                <Pencil className="w-3.5 h-3.5" />
                                            </Button>
                                            <Button
                                                variant="ghost" size="icon"
                                                className="h-7 w-7 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-lg"
                                                onClick={() => handleDelete(dept)}
                                                disabled={loadingId === dept._id}
                                                title="Delete department"
                                            >
                                                {loadingId === dept._id
                                                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                                    : <Trash2 className="w-3.5 h-3.5" />}
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
