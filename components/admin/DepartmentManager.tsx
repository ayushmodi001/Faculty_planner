'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Building2, Loader2, Trash2, X } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function DepartmentManager({ initialDepartments = [] }: { initialDepartments?: any[] }) {
    const router = useRouter();
    const [departments, setDepartments] = useState(initialDepartments);
    const [newDept, setNewDept] = useState({ name: '', code: '' });
    const [isAdding, setIsAdding] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleAdd = async () => {
        if (!newDept.name) return toast.error("Name is required");
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/departments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newDept)
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to add department");

            setDepartments([...departments, data]);
            setNewDept({ name: '', code: '' });
            setIsAdding(false);
            toast.success("Department added");
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card className="shadow-sm border-border overflow-hidden rounded-3xl transition-all hover:shadow-xl group">
            <CardHeader className="flex flex-row items-center justify-between">
                <div className="space-y-1">
                    <CardTitle className="text-lg font-black uppercase tracking-tight">Department Registry</CardTitle>
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-muted-foreground opacity-60">Manage institutional units</CardDescription>
                </div>
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 rounded-xl bg-primary/5 text-primary hover:bg-primary hover:text-white transition-all"
                    onClick={() => setIsAdding(!isAdding)}
                >
                    {isAdding ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                </Button>
            </CardHeader>
            <CardContent className="space-y-4">
                {isAdding && (
                    <div className="p-4 bg-muted/30 rounded-2xl border border-dashed border-border animate-in slide-in-from-top-2 duration-300">
                        <div className="grid gap-3">
                            <Input
                                placeholder="Department Name (e.g. Computer Science)"
                                value={newDept.name}
                                onChange={e => setNewDept({ ...newDept, name: e.target.value })}
                                className="h-9 text-xs"
                            />
                            <Input
                                placeholder="Code (e.g. CSE)"
                                value={newDept.code}
                                onChange={e => setNewDept({ ...newDept, code: e.target.value })}
                                className="h-9 text-xs"
                            />
                            <Button size="sm" className="w-full text-[9px] font-black uppercase tracking-widest h-9" onClick={handleAdd} disabled={isLoading}>
                                {isLoading ? <Loader2 className="w-3 h-3 animate-spin mr-2" /> : "Confirm Addition"}
                            </Button>
                        </div>
                    </div>
                )}

                <div className="space-y-2">
                    {departments.length === 0 ? (
                        <p className="text-center py-4 text-xs font-medium text-muted-foreground italic">No departments registered.</p>
                    ) : (
                        departments.map((dept) => (
                            <div key={dept._id} className="flex items-center justify-between p-3 rounded-2xl border border-transparent hover:border-border/60 hover:bg-muted/30 transition-all group/item">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-muted group-hover/item:bg-primary/10 group-hover/item:text-primary flex items-center justify-center transition-colors">
                                        <Building2 className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-foreground leading-tight">{dept.name}</p>
                                        <p className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">{dept.code || 'NO CODE'}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
