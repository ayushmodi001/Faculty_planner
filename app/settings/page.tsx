import React from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import ChangePasswordForm from './ChangePasswordForm';
import CollegeSettingsForm from '@/app/dashboard/principal/settings/SettingsForm';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CalendarRange } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function GlobalSettingsPage() {
    const session = await getSession();
    if (!session) redirect('/login');

    const role = (session as any).role || 'Student';

    return (
        <DashboardLayout role={role}>
            <div className="max-w-4xl mx-auto mb-8 flex flex-col justify-between border-b border-border pb-6 gap-4">
                <div>
                    <SwissSubHeading className="mb-2 text-primary">Account Management</SwissSubHeading>
                    <SwissHeading>Settings</SwissHeading>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage your account preferences, security, and access configuration.
                    </p>
                </div>
            </div>

            <div className="max-w-4xl mx-auto space-y-8">
                <ChangePasswordForm />

                {/* HOD Specific Settings */}
                {(role === 'HOD' || role === 'ADMIN' || role === 'PRINCIPAL') && (
                    <div className="space-y-8">
                        <div>
                            <h3 className="text-xl font-bold mb-4 border-b pb-2">College Administrative Settings</h3>
                            <CollegeSettingsForm />
                        </div>

                        {(role === 'HOD' || role === 'ADMIN') && (
                            <div>
                                <h3 className="text-xl font-bold mb-4 border-b pb-2">Academic Planning</h3>
                                <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold text-lg">Academic Calendar</h4>
                                        <p className="text-sm text-muted-foreground">Manage holidays, exams, and important academic dates visually.</p>
                                    </div>
                                    <Link href="/admin/calendar">
                                        <Button className="gap-2">
                                            <CalendarRange className="w-4 h-4" /> Open Calendar Config
                                        </Button>
                                    </Link>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
