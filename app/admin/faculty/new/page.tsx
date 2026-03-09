import React from 'react';
import CreateFacultyGroupForm from '@/components/CreateFacultyGroupForm';
import { ArrowLeft, Zap } from 'lucide-react';
import Link from 'next/link';
import { Button, Badge, SwissHeading } from '@/components/ui/SwissUI';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function NewFacultyGroupPage() {
    return (
        <DashboardLayout role="Admin">
            <div className="space-y-10 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Badge variant="orange" className="h-6">Configuration</Badge>
                            <Badge variant="navy" className="h-6">New Group</Badge>
                        </div>
                        <SwissHeading className="text-4xl md:text-5xl font-black text-[#0A1128] tracking-tight">Register Faculty Group</SwissHeading>
                        <p className="text-slate-500 font-medium mt-1">Create a new faculty group and assign subjects and faculty members.</p>
                    </div>
                    <Link href="/admin/faculty">
                        <Button variant="ghost" className="h-12 px-6 rounded-xl border border-slate-100 hover:bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-[#0A1128]">
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back to Faculty Groups
                        </Button>
                    </Link>
                </div>

                <div className="max-w-4xl mx-auto">
                    <CreateFacultyGroupForm />
                </div>
            </div>
        </DashboardLayout>
    );
}
