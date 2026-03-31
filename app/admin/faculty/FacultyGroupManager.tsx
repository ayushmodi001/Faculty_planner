'use client';

import React, { useState, useMemo } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Plus, Users, Trash2, CheckCircle2, ChevronRight,
    LayoutGrid, Activity, Building2, ChevronDown, ChevronUp,
    BookOpen, GraduationCap, Search, Layers
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';

const SEM_LABELS: Record<number, string> = {
    1: '1st', 2: '2nd', 3: '3rd', 4: '4th',
    5: '5th', 6: '6th', 7: '7th', 8: '8th',
};

function semLabel(sem: number) {
    return `${SEM_LABELS[sem] || sem} Semester`;
}

export default function FacultyGroupManager({ initialGroups }: { initialGroups: IFacultyGroup[] }) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const [collapsedYears, setCollapsedYears] = useState<Set<string>>(new Set());
    const [search, setSearch] = useState('');
    const router = useRouter();

    // ── Filter ────────────────────────────────────────────────────────────────
    const filtered = useMemo(() => {
        const q = search.toLowerCase();
        if (!q) return initialGroups;
        return initialGroups.filter(g =>
            g.name.toLowerCase().includes(q) ||
            (g as any).subjects?.some((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q))
        );
    }, [initialGroups, search]);

    // ── Hierarchy: dept_label → year → semester → [groups] ───────────────────
    const hierarchy = useMemo(() => {
        const tree: Record<string, Record<number, Record<number, IFacultyGroup[]>>> = {};
        for (const g of filtered) {
            const dept = (g as any).department_id?.name || (g as any).department || '(No Department)';
            const year = (g as any).year || 1;
            const sem = (g as any).semester || 1;
            if (!tree[dept]) tree[dept] = {};
            if (!tree[dept][year]) tree[dept][year] = {};
            if (!tree[dept][year][sem]) tree[dept][year][sem] = [];
            tree[dept][year][sem].push(g);
        }
        return tree;
    }, [filtered]);

    const toggleYear = (key: string) => {
        setCollapsedYears(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key); else next.add(key);
            return next;
        });
    };

    const handleSelect = (e: React.MouseEvent, id: string) => {
        e.preventDefault(); e.stopPropagation();
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
    };

    const handleDeleteSelected = async (e: React.MouseEvent) => {
        e.preventDefault(); e.stopPropagation();
        if (!confirm(`Delete ${selectedIds.length} selected group(s)? This cannot be undone.`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?ids=${selectedIds.join(',')}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete groups");
            toast.success(`${selectedIds.length} group(s) deleted`);
            setSelectedIds([]);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* ── Toolbar ── */}
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 flex-1 max-w-xs relative">
                    <Search className="absolute left-3 w-3.5 h-3.5 text-muted-foreground/40" />
                    <Input
                        placeholder="Search groups or subjects..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="pl-9 h-9 text-xs"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                        {filtered.length} group{filtered.length !== 1 ? 's' : ''}
                    </span>
                    {selectedIds.length > 0 && (
                        <Button variant="destructive" size="sm" onClick={handleDeleteSelected} disabled={isDeleting}
                            className="h-8 px-4 text-[9px] font-black uppercase tracking-widest">
                            <Trash2 className="w-3 h-3 mr-1.5" />
                            Delete ({selectedIds.length})
                        </Button>
                    )}
                    <Button asChild size="sm" className="h-8 px-4 text-[9px] font-black uppercase tracking-widest">
                        <Link href="/admin/faculty/new"><Plus className="w-3 h-3 mr-1.5" />New Group</Link>
                    </Button>
                </div>
            </div>

            {/* ── Empty State ── */}
            {initialGroups.length === 0 ? (
                <Card className="border-dashed py-20 text-center border-border/50 bg-muted/10">
                    <CardContent className="space-y-4">
                        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto border border-border">
                            <Layers className="w-8 h-8 text-muted-foreground/30" />
                        </div>
                        <div>
                            <p className="font-black text-foreground text-xl tracking-tight">No faculty groups yet</p>
                            <p className="text-muted-foreground text-sm max-w-xs mx-auto mt-1">
                                Create faculty groups to organize classes by department, year, and semester.
                            </p>
                        </div>
                        <Button asChild className="font-black uppercase tracking-widest text-[10px] h-11 px-8">
                            <Link href="/admin/faculty/new"><Plus className="w-4 h-4 mr-2" />Create First Group</Link>
                        </Button>
                    </CardContent>
                </Card>
            ) : filtered.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                    <Search className="w-8 h-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm font-medium">No results for "{search}"</p>
                </div>
            ) : (
                /* ── Hierarchy Tree ── */
                <div className="space-y-6">
                    {Object.entries(hierarchy).sort(([a], [b]) => a.localeCompare(b)).map(([deptName, years]) => (
                        <div key={deptName} className="space-y-3">
                            {/* Department header */}
                            <div className="flex items-center gap-2.5 pb-1 border-b border-border/60">
                                <div className="w-7 h-7 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                    <Building2 className="w-3.5 h-3.5" />
                                </div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-tight">{deptName}</h3>
                                <Badge variant="outline" className="text-[9px] font-black ml-auto">
                                    {Object.values(years).flatMap(sems => Object.values(sems)).flat().length} groups
                                </Badge>
                            </div>

                            {/* Years */}
                            {Object.entries(years).sort(([a], [b]) => Number(a) - Number(b)).map(([year, sems]) => {
                                const yearKey = `${deptName}-Y${year}`;
                                const collapsed = collapsedYears.has(yearKey);
                                const groupsInYear = Object.values(sems).flat();

                                return (
                                    <div key={year} className="ml-4">
                                        {/* Year collapsible row */}
                                        <button
                                            onClick={() => toggleYear(yearKey)}
                                            className="flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-xl hover:bg-muted/40 transition-colors group"
                                        >
                                            <div className="w-6 h-6 rounded-md bg-muted flex items-center justify-center text-[10px] font-black text-muted-foreground">
                                                Y{year}
                                            </div>
                                            <span className="text-xs font-black text-foreground">Year {year}</span>
                                            <span className="text-[9px] text-muted-foreground font-bold ml-1">
                                                ({groupsInYear.length} class{groupsInYear.length !== 1 ? 'es' : ''})
                                            </span>
                                            <div className="ml-auto text-muted-foreground/40 group-hover:text-muted-foreground transition-colors">
                                                {collapsed ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronUp className="w-3.5 h-3.5" />}
                                            </div>
                                        </button>

                                        {/* Semesters */}
                                        {!collapsed && (
                                            <div className="ml-6 mt-2 space-y-4">
                                                {Object.entries(sems).sort(([a], [b]) => Number(a) - Number(b)).map(([sem, groups]) => (
                                                    <div key={sem}>
                                                        {/* Semester label */}
                                                        <div className="flex items-center gap-2 mb-3">
                                                            <GraduationCap className="w-3 h-3 text-muted-foreground/40" />
                                                            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                                                                {semLabel(Number(sem))}
                                                            </span>
                                                            <div className="flex-1 h-px bg-border/40" />
                                                        </div>

                                                        {/* Group Cards */}
                                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                                            {groups.map((group) => {
                                                                const groupId = group._id as unknown as string;
                                                                const isSelected = selectedIds.includes(groupId);
                                                                const subjectCount = (group as any).subjects?.length || 0;
                                                                const memberCount = (group as any).members?.length || 0;

                                                                return (
                                                                    <Link key={groupId} href={`/admin/faculty/${groupId}`} className="block relative group">
                                                                        <Card className={cn(
                                                                            "relative transition-all duration-300 rounded-2xl overflow-hidden hover:shadow-xl flex flex-col border-border/60 hover:border-primary/20",
                                                                            isSelected && "ring-2 ring-primary border-primary shadow-primary/10 shadow-lg"
                                                                        )}>
                                                                            <div className="p-4">
                                                                                <div className="flex justify-between items-start mb-3">
                                                                                    <div className="flex items-center gap-2 flex-wrap flex-1 min-w-0">
                                                                                        <Badge className="text-[9px] font-black bg-primary/10 text-primary border-0 px-2">
                                                                                            Y{group.year} · S{group.semester}
                                                                                        </Badge>
                                                                                        {group.section && (
                                                                                            <Badge variant="outline" className="text-[9px] font-black px-2">
                                                                                                Sec {group.section}
                                                                                            </Badge>
                                                                                        )}
                                                                                    </div>
                                                                                    {/* Checkbox */}
                                                                                    <div
                                                                                        className={cn(
                                                                                            "w-6 h-6 rounded-md flex items-center justify-center border-2 transition-all shrink-0",
                                                                                            isSelected
                                                                                                ? "bg-primary border-primary text-primary-foreground"
                                                                                                : "bg-card border-border text-transparent group-hover:border-primary/30"
                                                                                        )}
                                                                                        onClick={(e) => handleSelect(e, groupId)}
                                                                                    >
                                                                                        <CheckCircle2 className="w-3.5 h-3.5" />
                                                                                    </div>
                                                                                </div>

                                                                                <h4 className="text-base font-black text-foreground leading-tight uppercase tracking-tight truncate group-hover:text-primary transition-colors mb-2">
                                                                                    {group.name}
                                                                                </h4>

                                                                                {/* Stats row */}
                                                                                <div className="flex items-center gap-3 text-[10px] font-black text-muted-foreground">
                                                                                    <span className="flex items-center gap-1">
                                                                                        <Users className="w-3 h-3" />{memberCount} faculty
                                                                                    </span>
                                                                                    <span className="flex items-center gap-1">
                                                                                        <BookOpen className="w-3 h-3" />{subjectCount} subjects
                                                                                    </span>
                                                                                </div>

                                                                                {/* Subject chips */}
                                                                                <div className="mt-3 flex flex-wrap gap-1.5">
                                                                                    {((group as any).subjects || []).slice(0, 3).map((subject: any, sIdx: number) => (
                                                                                        <Badge key={sIdx} variant="outline"
                                                                                            className="text-[8px] font-black uppercase tracking-tighter border-border/50 bg-muted/30 text-muted-foreground px-2 py-0.5 rounded-md">
                                                                                            {typeof subject === 'string' ? subject : subject.name}
                                                                                        </Badge>
                                                                                    ))}
                                                                                    {subjectCount > 3 && (
                                                                                        <span className="text-[9px] text-muted-foreground/50 font-black leading-none pt-1">
                                                                                            +{subjectCount - 3}
                                                                                        </span>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            <div className="px-4 py-3 bg-muted/20 border-t border-border/30 flex items-center justify-between mt-auto group-hover:bg-muted/40 transition-colors">
                                                                                <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600">
                                                                                    <Activity className="w-3 h-3" /> Active
                                                                                </span>
                                                                                <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
                                                                            </div>
                                                                        </Card>
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
