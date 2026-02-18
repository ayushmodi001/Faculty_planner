'use client';

import React from 'react';
import { NeoCard, NeoButton } from '@/components/ui/NeoBrutalism';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Plus, Users } from 'lucide-react';
import Link from 'next/link';

interface FacultyGroupListProps {
    groups: IFacultyGroup[];
}

export default function FacultyGroupList({ groups }: FacultyGroupListProps) {
    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-yellow-200 border-2 border-black p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight">Faculty Groups</h2>
                    <p className="font-mono text-sm mt-1">Manage departmental groups and timetables.</p>
                </div>
                <Link href="/admin/faculty/new">
                    <NeoButton className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white border-black">
                        <Plus className="w-5 h-5" />
                        Add New Group
                    </NeoButton>
                </Link>
            </div>

            {groups.length === 0 ? (
                <NeoCard className="bg-gray-100 text-center py-12">
                    <Users className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-xl font-bold text-gray-600">No Faculty Groups Found</h3>
                    <p className="text-gray-500 mt-2">Start by creating your first group above.</p>
                </NeoCard>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {groups.map((group) => (
                        <NeoCard key={group._id as string} hoverEffect className="bg-white">
                            <div className="flex justify-between items-start mb-4">
                                <div className="bg-black text-white px-3 py-1 font-mono text-xs font-bold uppercase rotate-[-2deg]">
                                    {group.subjects.length} Subjects
                                </div>
                                <Users className="w-6 h-6 text-gray-700" />
                            </div>

                            <h3 className="text-xl font-black mb-2 uppercase">{group.name}</h3>

                            <div className="space-y-2 mb-4">
                                {group.subjects.slice(0, 3).map((subject, idx) => (
                                    <div key={idx} className="bg-gray-100 border border-black px-2 py-1 text-sm font-medium truncate">
                                        {subject}
                                    </div>
                                ))}
                                {group.subjects.length > 3 && (
                                    <div className="text-xs text-gray-500 font-mono pl-1">
                                        + {group.subjects.length - 3} more...
                                    </div>
                                )}
                            </div>

                            <div className="border-t-2 border-dashed border-gray-300 pt-4 mt-4 flex justify-between items-center text-xs font-mono text-gray-600">
                                <span>Created: {new Date(group.createdAt as any).toLocaleDateString()}</span>
                                <span className="bg-green-100 text-green-800 px-2 py-0.5 border border-green-800 rounded-full">
                                    Active
                                </span>
                            </div>
                        </NeoCard>
                    ))}
                </div>
            )}
        </div>
    );
}
