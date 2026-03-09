import React from 'react';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Plus, Users, LayoutGrid, Activity } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';
import FacultyGroupManager from './FacultyGroupManager';

export const dynamic = 'force-dynamic';

export default async function FacultyPage() {
    const result = await getAllFacultyGroups();
    const groups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (        <DashboardLayout role="Admin">
            <div className="space-y-6 animate-in fade-in duration-500">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">Faculty Groups</h1>
                        <p className="text-muted-foreground text-sm mt-1">Manage academic groups and their subject and faculty assignments.</p>
                    </div>
                    <Link href="/admin/faculty/new">
                        <Button className="font-black uppercase tracking-widest text-[10px] h-11 px-6 shadow-lg shadow-primary/20">
                            <Plus className="w-4 h-4 mr-2" /> Add New Group
                        </Button>
                    </Link>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card className="hover:shadow-md transition-all border-border/60">
                        <CardContent className="p-6 flex items-center gap-4">
                            <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
                                <Users className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1.5">Total Groups</p>
                                <p className="text-2xl font-black text-foreground leading-none">{groups.length}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="pt-2">
                    <FacultyGroupManager initialGroups={groups} />
                </div>
            </div>
        </DashboardLayout>
    );
}
