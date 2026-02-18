'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createFacultyGroup } from '@/app/actions/faculty';
import { NeoCard, NeoButton } from '@/components/ui/NeoBrutalism';
import { Loader2, X, Plus } from 'lucide-react';

export default function CreateFacultyGroupForm() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        currentSubject: '',
        subjects: [] as string[]
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleAddSubject = () => {
        if (formData.currentSubject.trim() === '') return;
        setFormData(prev => ({
            ...prev,
            subjects: [...prev.subjects, prev.currentSubject.trim()],
            currentSubject: ''
        }));
    };

    const removeSubject = (index: number) => {
        setFormData(prev => ({
            ...prev,
            subjects: prev.subjects.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.subjects.length === 0) {
            setError('Please add at least one subject');
            return;
        }

        setLoading(true);
        setError(null);

        const result = await createFacultyGroup({
            name: formData.name,
            subjects: formData.subjects
            // Timetable will be handled in a separate step
        });

        if (result.success) {
            router.push('/admin/faculty');
            router.refresh();
        } else {
            setError(result.error || 'Something went wrong');
        }

        setLoading(false);
    };

    return (
        <NeoCard className="max-w-xl mx-auto bg-white p-8">
            <h2 className="text-3xl font-black mb-6 border-b-4 border-black pb-2">Create New Faculty Group</h2>

            {error && (
                <div className="bg-red-100 border-2 border-red-500 text-red-700 p-3 mb-6 font-bold shadow-[4px_4px_0px_0px_rgba(239,68,68,1)]">
                    ERROR: {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Input */}
                <div>
                    <label className="block text-sm font-bold uppercase mb-1 tracking-wider">Group Name</label>
                    <input
                        type="text"
                        placeholder="e.g. CS-Sem5-DivA"
                        className="w-full border-2 border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] transition-all"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                </div>

                {/* Subjects Input */}
                <div>
                    <label className="block text-sm font-bold uppercase mb-1 tracking-wider">Subjects</label>
                    <div className="flex gap-2 mb-3">
                        <input
                            type="text"
                            placeholder="e.g. Data Structures"
                            className="flex-1 border-2 border-black p-3 font-mono focus:outline-none focus:ring-4 focus:ring-yellow-300 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                            value={formData.currentSubject}
                            onChange={(e) => setFormData({ ...formData, currentSubject: e.target.value })}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSubject())}
                        />
                        <button
                            type="button"
                            onClick={handleAddSubject}
                            className="bg-black text-white px-4 font-bold border-2 border-black hover:bg-gray-800 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-[2px] active:translate-y-[2px]"
                        >
                            <Plus className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Subject Pills */}
                    <div className="flex flex-wrap gap-2">
                        {formData.subjects.map((sub, idx) => (
                            <span key={idx} className="bg-yellow-200 border-2 border-black px-3 py-1 font-bold flex items-center gap-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] rotate-[-1deg] last:rotate-[2deg]">
                                {sub}
                                <button type="button" onClick={() => removeSubject(idx)} className="hover:text-red-600">
                                    <X className="w-4 h-4" />
                                </button>
                            </span>
                        ))}
                        {formData.subjects.length === 0 && (
                            <span className="text-gray-400 font-mono italic text-sm">No subjects added yet...</span>
                        )}
                    </div>
                </div>

                <div className="pt-4 border-t-2 border-black border-dashed">
                    <NeoButton
                        type="submit"
                        disabled={loading}
                        className="w-full py-4 text-lg uppercase tracking-widest bg-green-400 hover:bg-green-500 text-black border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]"
                    >
                        {loading ? (
                            <span className="flex items-center justify-center gap-2">
                                <Loader2 className="animate-spin" /> Processing...
                            </span>
                        ) : (
                            'Create Faculty Group'
                        )}
                    </NeoButton>
                </div>
            </form>
        </NeoCard>
    );
}
