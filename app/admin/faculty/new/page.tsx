import React from 'react';
import CreateFacultyGroupForm from '@/components/CreateFacultyGroupForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { NeoButton } from '@/components/ui/NeoBrutalism';

export default function NewFacultyGroupPage() {
    return (
        <div className="min-h-screen bg-dots-pattern bg-zinc-100 p-8 flex flex-col items-center justify-center">
            <div className="w-full max-w-2xl mb-8 flex items-center">
                <Link href="/admin/faculty">
                    <NeoButton variant="secondary" className="flex items-center gap-2">
                        <ArrowLeft className="w-5 h-5" /> Back to List
                    </NeoButton>
                </Link>
            </div>

            <div className="w-full max-w-2xl relative">
                <div className="absolute -top-4 -left-4 w-full h-full bg-black border-2 border-black z-0"></div>
                <div className="relative z-10">
                    <CreateFacultyGroupForm />
                </div>
            </div>
        </div>
    );
}
