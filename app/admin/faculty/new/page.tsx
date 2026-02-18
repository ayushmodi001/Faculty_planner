import React from 'react';
import CreateFacultyGroupForm from '@/components/CreateFacultyGroupForm';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';

export default function NewFacultyGroupPage() {
    return (
        <DashboardLayout role="HOD">
            <div className="max-w-3xl mx-auto mb-8 animate-in slide-in-from-bottom-5 duration-500">
                <Link href="/admin/faculty">
                    <Button variant="ghost" className="pl-0 gap-2 mb-4 hover:bg-transparent hover:text-primary">
                        <ArrowLeft className="w-4 h-4" /> Back to Faculty List
                    </Button>
                </Link>

                <SwissSubHeading className="text-primary mb-1">Configuration</SwissSubHeading>
                <SwissHeading>Create New Group</SwissHeading>
                <p className="text-muted-foreground mt-2 text-sm">
                    Define a new cohort and assign subject responsibilities.
                </p>
            </div>

            <div className="max-w-3xl mx-auto animate-in slide-in-from-bottom-10 duration-700 delay-100">
                <CreateFacultyGroupForm />
            </div>
        </DashboardLayout>
    );
}
