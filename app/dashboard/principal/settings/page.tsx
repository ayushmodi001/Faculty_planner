import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import SettingsForm from './SettingsForm';

export const dynamic = 'force-dynamic';

export default async function PrincipalSettingsPage() {
    return (
        <DashboardLayout role="Principal">
            <div className="max-w-4xl mx-auto mb-8 flex flex-col justify-between border-b border-border pb-6 gap-4">
                <div>
                    <SwissSubHeading className="mb-2 text-primary">Administration Portal</SwissSubHeading>
                    <SwissHeading>College Settings</SwissHeading>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Define college hours and timetable slot duration defaults.
                    </p>
                </div>
            </div>

            <div className="max-w-xl mx-auto">
                <SettingsForm />
            </div>
        </DashboardLayout>
    );
}
