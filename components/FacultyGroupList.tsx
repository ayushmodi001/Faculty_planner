'use client';

import React from 'react';
import { NeoCard, NeoButton } from '@/components/ui/NeoBrutalism';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Plus, Users, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

interface FacultyGroupListProps {
    groups: IFacultyGroup[];
}

export default function FacultyGroupList({ groups }: FacultyGroupListProps) {
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [isDeleting, setIsDeleting] = useState(false);
    const router = useRouter();

    const handleSelect = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
        );
    };

    const handleSelectAll = () => {
        if (selectedIds.length === groups.length && groups.length > 0) {
            setSelectedIds([]);
        } else {
            setSelectedIds(groups.map(g => g._id as unknown as string));
        }
    };

    const handleDeleteSelected = async () => {
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
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-yellow-200 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Faculty Groups</h2>
                    <p className="font-mono text-sm mt-1">Manage departmental groups and timetables.</p>
                </div>
                <div className="flex items-center gap-3">
                    {groups.length > 0 && (
                        <NeoButton
                            className="flex items-center gap-2 bg-white hover:bg-gray-100 text-black border-black"
                            onClick={handleSelectAll}
                        >
                            {selectedIds.length === groups.length ? 'Deselect All' : 'Select All'}
                        </NeoButton>
                    )}
                    {selectedIds.length > 0 && (
                        <NeoButton
                            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white border-black"
                            onClick={handleDeleteSelected}
                            disabled={isDeleting}
                        >
                            <Trash2 className="w-5 h-5" />
                            Delete ({selectedIds.length})
                        </NeoButton>
                    )}
                    <Link href="/admin/faculty/new">
                        <NeoButton className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-black">
                            <Plus className="w-5 h-5" />
                            Add New Group
                        </NeoButton>
                    </Link>
                </div>
            </div>

            {groups.length === 0 ? (
                <NeoCard className="bg-gray-100 text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600">No Faculty Groups Found</h3>
                    <p className="text-gray-500 mt-2">Start by creating your first group above.</p>
                </NeoCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => {
                        const groupIdString = group._id as unknown as string;
                        const isSelected = selectedIds.includes(groupIdString);

                        return (
                            <NeoCard
                                key={groupIdString}
                                hoverEffect
                                className={`transition-colors ${isSelected ? 'bg-red-50 border-red-500' : 'bg-white'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="checkbox"
                                            className="w-5 h-5 border-2 border-black accent-red-600 cursor-pointer"
                                            checked={isSelected}
                                            onChange={() => handleSelect(groupIdString)}
                                        />
                                        <div className="bg-black text-white px-3 py-1 font-mono text-xs font-bold uppercase rotate-[-2deg]">
                                            {((group as any).subjects || []).length} Subjects
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Users className="w-6 h-6 text-gray-700" />
                                    </div>
                                </div>

                                <Link href={`/admin/faculty/${groupIdString}`} className="block hover:underline hover:text-blue-600">
                                    <h3 className="text-xl font-black mb-2 uppercase">{group.name}</h3>
                                </Link>

                                <div className="space-y-2 mb-4">
                                    {((group as any).subjects || []).slice(0, 3).map((subject: any, idx: number) => (
                                        <div key={idx} className="bg-gray-100 border border-black px-2 py-1 text-sm font-medium truncate">
                                            {subject}
                                        </div>
                                    ))}
                                    {((group as any).subjects || []).length > 3 && (
                                        <div className="text-xs text-gray-500 font-mono pl-1">
                                            + {((group as any).subjects || []).length - 3} more...
                                        </div>
                                    )}
                                </div>

                                <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4 flex justify-between items-center text-xs font-mono text-gray-600">
                                    <span>Created: {new Date((group as any).createdAt).toLocaleDateString()}</span>
                                    <span className="bg-green-100 text-green-800 px-2 py-0.5 border border-green-800 rounded-full">
                                        Active
                                    </span>
                                </div>
                            </NeoCard>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
