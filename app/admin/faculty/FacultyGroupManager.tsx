'use client';

import React, { useState } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
    Plus,
    Users,
    BookOpen,
    Trash2,
    CheckCircle2,
    ChevronRight,
    LayoutGrid,
    Sparkles,
    Activity
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

export default function FacultyGroupManager({ initialGroups }: { initialGroups: IFacultyGroup[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleSelect = (e: React.MouseEvent, id: string) => {
        e.preventDefault();
        e.stopPropagation();
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = (e: React.MouseEvent) => {
        e.preventDefault();
        if (selectedIds.length === initialGroups.length && initialGroups.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(initialGroups.map(g => g._id as unknown as string));
        }
    };

    const handleDeleteSelected = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} groups?`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?ids=${selectedIds.join(',')}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Failed to delete groups");

            toast.success("Groups deleted");
            setSelectedIds([]);
            router.refresh();
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Toolbar */}
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                    <LayoutGrid className="w-4 h-4 text-muted-foreground/40" />
                    <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Faculty Groups</h3>
                </div>
                <div className="flex gap-3">
                    {initialGroups.length > 0 && (
                        <Button variant="ghost" size="sm" onClick={handleSelectAll} className="h-9 px-4 text-[10px] font-black uppercase tracking-widest hover:bg-muted">
                            {selectedIds.length === initialGroups.length ? 'Deselect All' : 'Select All'}
                        </Button>
                    )}
                    {selectedIds.length > 0 && (                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isDeleting} className="h-9 px-5 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-destructive/20 transition-all hover:scale-105 active:scale-95 leading-none">
                            <Trash2 className="w-3.5 h-3.5 mr-2" /> Delete ({selectedIds.length})
                        </Button>
                    )}
                </div>
            </div>

            {/* Grid */}
            {initialGroups.length === 0 ? (
                <Card className="border-dashed py-24 text-center border-border/50 bg-muted/10">
                    <CardContent className="space-y-6">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto border border-border">
                            <Users className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div className="space-y-2">
                            <p className="font-black text-foreground text-xl tracking-tight">System holds no records</p>                            <p className="text-muted-foreground text-sm max-w-xs mx-auto">Create a faculty group to start assigning subjects and faculty members.</p>
                        </div>
                        <Button asChild className="font-black uppercase tracking-widest text-[10px] h-11 px-8">
                            <Link href="/admin/faculty/new">Add First Group</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {initialGroups.map((group, idx) => {
                        const groupId = group._id as unknown as string;
                        const isSelected = selectedIds.includes(groupId);

                        return (
                            <Link key={groupId} href={`/admin/faculty/${groupId}`} className="block relative group">
                                <Card className={cn(
                                    "relative transition-all duration-500 rounded-3xl overflow-hidden hover:shadow-2xl h-[260px] flex flex-col justify-between border-border/60 hover:border-primary/20",
                                    isSelected && "ring-2 ring-primary border-primary shadow-xl shadow-primary/10"
                                )}>
                                    <div className="p-6">
                                        <div className="flex justify-between items-start mb-5">
                                            <Badge variant="secondary" className="px-3 py-1 h-7 text-[9px] font-black uppercase tracking-widest bg-muted text-muted-foreground border-none">
                                                {(group as any).members?.length || 0} Staff Assigned
                                            </Badge>
                                            <div
                                                className={cn(
                                                    "w-7 h-7 rounded-lg flex items-center justify-center border-2 transition-all duration-300 shadow-sm",
                                                    isSelected ? "bg-primary border-primary text-primary-foreground scale-110" : "bg-card border-border text-transparent group-hover:border-primary/30"
                                                )}
                                                onClick={(e) => handleSelect(e, groupId)}
                                            >
                                                <CheckCircle2 className="w-4 h-4" />
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <h4 className="text-xl font-black text-foreground leading-tight uppercase tracking-tight truncate pr-8 group-hover:text-primary transition-colors">{group.name}</h4>
                                            <p className="text-[10px] text-muted-foreground/50 font-black uppercase tracking-widest">Year {(group as any).year || '—'} · Sem {(group as any).semester || '—'}</p>
                                        </div>

                                        <div className="mt-5 flex flex-wrap gap-2">
                                            {((group as any).subjects || []).slice(0, 3).map((subject: any, sIdx: number) => (
                                                <Badge key={sIdx} variant="outline" className="text-[8px] font-black uppercase tracking-tighter border-border/50 bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md">
                                                    {subject}
                                                </Badge>
                                            ))}
                                            {((group as any).subjects || []).length > 3 && (
                                                <span className="text-[9px] text-muted-foreground/40 font-black uppercase tracking-widest leading-none pt-1">+ {((group as any).subjects || []).length - 3} more</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="px-6 py-4 bg-muted/30 border-t border-border/40 flex items-center justify-between mt-auto group-hover:bg-muted/50 transition-colors">
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-3.5 h-3.5 text-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.3)]" />
                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Active Group</span>
                                        </div>
                                        <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                                    </div>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
