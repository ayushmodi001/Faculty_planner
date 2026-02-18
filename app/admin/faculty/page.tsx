import React from 'react';
import { getAllFacultyGroups } from '@/app/actions/faculty';
import { IFacultyGroup } from '@/models/FacultyGroup';
import { Button, SwissHeading, SwissSubHeading, Card, CardHeader, CardTitle, CardContent, Badge } from '@/components/ui/SwissUI';
import { Plus, Users, BookOpen, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import DashboardLayout from '@/components/layout/DashboardLayout';

export const dynamic = 'force-dynamic';

export default async function FacultyPage() {
    const result = await getAllFacultyGroups();
    const groups = result.success ? (result.data as IFacultyGroup[]) : [];

    return (
        <DashboardLayout role="HOD">

            {/* Page Header */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between md:items-end border-b border-border pb-6 gap-4">
                <div>
                    <SwissSubHeading className="mb-2 text-primary">Administration Portal</SwissSubHeading>
                    <SwissHeading>Faculty Groups</SwissHeading>
                    <p className="text-muted-foreground mt-2 max-w-2xl">
                        Manage department-level faculty groups, assign subjects, and configure timetables.
                    </p>
                </div>
                <Link href="/admin/faculty/new">
                    <Button className="gap-2 shadow-lg hover:shadow-xl transition-all w-full md:w-auto">
                        <Plus className="w-4 h-4" /> Create New Group
                    </Button>
                </Link>
            </div>

            <div className="max-w-7xl mx-auto">
                {groups.length === 0 ? (
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
                        {groups.map((group) => (
                            <Link key={group._id as string} href={`#${group._id}`}>
                                <Card className="group hover:border-primary/50 transition-all duration-300 h-full cursor-pointer">
                                    <CardHeader className="pb-3">
                                        <div className="flex justify-between items-start">
                                            <Badge variant="default" className="mb-2 opacity-90 group-hover:opacity-100 transition-opacity">
                                                {group.subjects.length} Subjects
                                            </Badge>
                                            <Users className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
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
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
