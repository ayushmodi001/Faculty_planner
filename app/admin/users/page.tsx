'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function UserManagementPage() {
    const [isLoading, setIsLoading] = useState(false);

    // Single User State
    const [singleUser, setSingleUser] = useState({
        name: '', email: '', password: '', role: 'FACULTY', department: '', mobile: '', facultyType: 'JUNIOR'
    });

    // Bulk User State
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');

    // --- Actions ---

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(singleUser)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Failed to create user");

            toast.success("User Created", { description: `${singleUser.name} added successfully.` });
            setSingleUser({ name: '', email: '', password: '', role: 'FACULTY', department: '', mobile: '', facultyType: 'JUNIOR' }); // Reset
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        const reader = new FileReader();

        reader.onload = (evt) => {
            const bstr = evt.target?.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);
            setBulkData(data);
            toast.info("File Parsed", { description: `Loaded ${data.length} records. Review before uploading.` });
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkSubmit = async () => {
        if (bulkData.length === 0) return;

        setIsLoading(true);
        try {
            // Transform data if keys don't match exactly or add defaults
            const formattedData = bulkData.map((row: any) => ({
                name: row.Name || row.name,
                email: row.Email || row.email,
                password: row.Password || row.password || 'Welcome123', // Default if missing
                role: (row.Role || row.role || 'FACULTY').toUpperCase(),
                department: row.Department || row.department,
                mobile: String(row.Mobile || row.mobile || ''),
                facultyType: (row.Type || row.type || row["Faculty Type"] || 'JUNIOR').toUpperCase()
            }));

            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formattedData)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Bulk upload failed");

            toast.success("Bulk Operation Complete", {
                description: `Created: ${data.createdCount}, Errors: ${data.errorCount}`
            });

            if (data.createdCount > 0) {
                setBulkData([]);
                setFileName('');
            }

        } catch (err: any) {
            toast.error("Bulk Upload Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <DashboardLayout role="HOD"> {/* Assuming HOD context for layout */}
            <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-5 duration-500">

                <div>
                    <SwissSubHeading className="mb-1 text-primary">Administration</SwissSubHeading>
                    <SwissHeading>User Management</SwissHeading>
                    <p className="text-muted-foreground mt-2">Add faculty, students, or staff to the platform.</p>
                </div>

                <Tabs defaultValue="single" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 max-w-md">
                        <TabsTrigger value="single">Single Entry</TabsTrigger>
                        <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                    </TabsList>

                    {/* --- Single User Form --- */}
                    <TabsContent value="single">
                        <Card>
                            <CardHeader>
                                <CardTitle>Add New User</CardTitle>
                                <CardDescription>Manually create a single account.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSingleSubmit} className="grid gap-6 md:grid-cols-2">
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Full Name</label>
                                        <Input
                                            placeholder="Dr. John Doe"
                                            value={singleUser.name}
                                            onChange={e => setSingleUser({ ...singleUser, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Email / ID</label>
                                        <Input
                                            type="email"
                                            placeholder="john.doe@university.edu"
                                            value={singleUser.email}
                                            onChange={e => setSingleUser({ ...singleUser, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Role</label>
                                        <Select
                                            value={singleUser.role}
                                            onValueChange={val => setSingleUser({ ...singleUser, role: val })}
                                        >
                                            <SelectTrigger>
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="FACULTY">Faculty</SelectItem>
                                                <SelectItem value="STUDENT">Student</SelectItem>
                                                <SelectItem value="HOD">HOD</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    {singleUser.role === 'FACULTY' && (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                            <label className="text-sm font-medium">Faculty Type</label>
                                            <Select
                                                value={singleUser.facultyType}
                                                onValueChange={val => setSingleUser({ ...singleUser, facultyType: val })}
                                            >
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    <SelectItem value="JUNIOR">Junior Faculty</SelectItem>
                                                    <SelectItem value="SENIOR">Senior Faculty</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    )}
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Department</label>
                                        <Input
                                            placeholder="Computer Science"
                                            value={singleUser.department}
                                            onChange={e => setSingleUser({ ...singleUser, department: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-medium">Default Password</label>
                                        <Input
                                            type="password"
                                            value={singleUser.password}
                                            onChange={e => setSingleUser({ ...singleUser, password: e.target.value })}
                                            placeholder="Min. 6 characters"
                                            required
                                        />
                                    </div>
                                    <div className="flex items-end">
                                        <Button className="w-full" disabled={isLoading}>
                                            {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                            Create Account
                                        </Button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* --- Bulk Upload Form --- */}
                    <TabsContent value="bulk">
                        <Card>
                            <CardHeader>
                                <CardTitle>Bulk Import</CardTitle>
                                <CardDescription>Upload an Excel (.xlsx) or CSV file with columns: Name, Email, Password, Role, Department.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="border-2 border-dashed rounded-lg p-10 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                                    <FileSpreadsheet className="h-10 w-10 text-muted-foreground mb-4" />
                                    <h3 className="text-lg font-semibold mb-1">Drag and drop or click to upload</h3>
                                    <p className="text-sm text-muted-foreground mb-4">Support .xlsx, .xls, .csv</p>
                                    <Input
                                        type="file"
                                        accept=".xlsx, .xls, .csv"
                                        className="max-w-xs"
                                        onChange={handleFileUpload}
                                    />
                                </div>

                                {bulkData.length > 0 && (
                                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center justify-between bg-muted/30 p-4 rounded-md border">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="text-green-500 h-5 w-5" />
                                                <div>
                                                    <p className="font-medium text-sm">Ready to import {bulkData.length} users</p>
                                                    <p className="text-xs text-muted-foreground">Source: {fileName}</p>
                                                </div>
                                            </div>
                                            <Button onClick={handleBulkSubmit} disabled={isLoading}>
                                                {isLoading ? <Loader2 className="animate-spin mr-2" /> : <Upload className="mr-2 h-4 w-4" />}
                                                Start Import
                                            </Button>
                                        </div>

                                        <div className="max-h-60 overflow-auto border rounded-md">
                                            <table className="w-full text-sm">
                                                <thead className="bg-muted sticky top-0">
                                                    <tr>
                                                        <th className="p-2 text-left font-medium">Name</th>
                                                        <th className="p-2 text-left font-medium">Email</th>
                                                        <th className="p-2 text-left font-medium">Role</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {bulkData.slice(0, 50).map((row: any, i) => (
                                                        <tr key={i} className="border-t hover:bg-muted/20">
                                                            <td className="p-2">{row.Name || row.name}</td>
                                                            <td className="p-2">{row.Email || row.email}</td>
                                                            <td className="p-2">{row.Role || row.role}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                            {bulkData.length > 50 && (
                                                <div className="p-2 text-center text-xs text-muted-foreground bg-muted/10">
                                                    And {bulkData.length - 50} more...
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
