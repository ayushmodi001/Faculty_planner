'use client';

import React, { useState } from 'react';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Button, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/SwissUI';
import { Plus, Users, BookOpen, Calendar as CalendarIcon, Trash2, CheckCircle2 } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

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
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} faculty groups?`)) return;
        setIsDeleting(true);
        try {
            const res = await fetch(`/api/admin/faculty/groups?ids=${selectedIds.join(',')}`, {
                method: 'DELETE'
            });
            if (!res.ok) throw new Error("Failed to delete groups");

            toast.success(`${selectedIds.length} Groups deleted`);
            setSelectedIds([]);
            router.refresh();
        } catch (err: any) {
            toast.error(err.message || "Failed to delete groups");
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <div>
            {/* Top Toolbar */}
            <div className="flex justify-end gap-3 mb-6">
                {initialGroups.length > 0 && (
                    <Button variant="outline" onClick={handleSelectAll} className="gap-2">
                        {selectedIds.length === initialGroups.length ? 'Deselect All' : 'Select All'}
                    </Button>
                )}
                {selectedIds.length > 0 && (
                    <Button variant="destructive" onClick={handleDeleteSelected} disabled={isDeleting} className="gap-2 bg-red-600 hover:bg-red-700">
                        <Trash2 className="w-4 h-4" /> Delete ({selectedIds.length})
                    </Button>
                )}
            </div>

            {/* Grid */}
            {initialGroups.length === 0 ? (
                <Card className="border-dashed border-2 bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                            <Users className="w-8 h-8 text-muted-foreground" />
                        </div>
                        <h3 className="text-lg font-bold text-foreground">No Faculty Groups Found</h3>
                        <p className="text-muted-foreground mb-6 max-w-sm">
                            Get started by creating your first faculty group to begin scheduling classes.
                        </p>
                        <Link href="/admin/faculty/new">
                            <Button variant="outline">Create Group</Button>
                        </Link>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
                    {initialGroups.map((group) => {
                        const groupId = group._id as unknown as string;
                        const isSelected = selectedIds.includes(groupId);

                        return (
                            <Link key={groupId} href={`/admin/faculty/${groupId}`} className="block relative">
                                <Card className={`group hover:border-primary/50 transition-all duration-300 h-full cursor-pointer ${isSelected ? 'ring-2 ring-blue-500 border-blue-500 bg-blue-50/20' : ''}`}>

                                    {/* Selection Checkbox */}
                                    <div
                                        className={`absolute top-4 right-4 z-10 p-1 rounded-full bg-background border-2 transition-all ${isSelected ? 'border-transparent text-blue-600' : 'border-muted-foreground/30 text-transparent hover:border-blue-400 group-hover:border-blue-400'}`}
                                        onClick={(e) => handleSelect(e, groupId)}
                                    >
                                        <CheckCircle2 className="w-5 h-5 fill-current bg-background rounded-full" />
                                    </div>

                                    <CardHeader className="pb-3 pr-12">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="default" className="mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                                {group.subjects.length} Subjects • {group.members?.length || 0} Faculty
                                            </Badge>
                                        </div>
                                        <CardTitle className="text-xl uppercase tracking-tight">{group.name}</CardTitle>
                                    </CardHeader>

                                    <CardContent>
                                        <div className="space-y-3 mb-6">
                                            {group.subjects.slice(0, 3).map((subject, idx) => (
                                                <div key={idx} className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 p-2 rounded-sm border border-transparent hover:border-border transition-colors">
                                                    <BookOpen className="w-3 h-3 text-primary/70" />
                                                    <span className="truncate flex-1">{subject}</span>
                                                </div>
                                            ))}
                                            {group.subjects.length > 3 && (
                                                <div className="text-xs font-medium text-primary pl-1">
                                                    + {group.subjects.length - 3} more subjects...
                                                </div>
                                            )}
                                        </div>

                                        <div className="pt-4 border-t border-border flex justify-between items-center text-xs text-muted-foreground">
                                            <div className="flex items-center gap-1">
                                                <CalendarIcon className="w-3 h-3" />
                                                <span>Active</span>
                                            </div>
                                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </Link>
                        )
                    })}
                </div>
            )}
        </div>
    );
}
