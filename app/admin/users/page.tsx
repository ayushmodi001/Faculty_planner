'use client';

import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Button, SwissHeading, SwissSubHeading } from '@/components/ui/SwissUI';
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, UserPlus, Upload, FileSpreadsheet, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { SearchableSelect } from "@/components/ui/searchable-select";
import DashboardLayout from '@/components/layout/DashboardLayout';

export default function UserManagementPage() {
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);

    // Single User State
    const [singleUser, setSingleUser] = useState({
        _id: '', name: '', email: '', password: '', role: 'FACULTY', department: '', mobile: '', facultyType: 'JUNIOR', facultyGroupName: ''
    });

    // Bulk User State
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [facultyGroups, setFacultyGroups] = useState<any[]>([]);

    React.useEffect(() => {
        fetchUsers();
        fetchGroups();
    }, []);

    const fetchGroups = async () => {
        try {
            const res = await fetch('/api/admin/faculty/list'); // I'll create this or use existing
            const data = await res.json();
            if (data.success) setFacultyGroups(data.groups);
        } catch (error) {
            console.error("Failed to fetch groups", error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch (error) {
            console.error("Failed to fetch users", error);
        }
    };

    // --- Actions ---

    const handleSingleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing ? singleUser : { ...singleUser, _id: undefined };

            const res = await fetch('/api/admin/users', {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });
            const data = await res.json();

            if (!res.ok) throw new Error(data.error || "Operation failed");

            toast.success(isEditing ? "User Updated" : "User Created", { description: `${singleUser.name} ${isEditing ? 'updated' : 'added'} successfully.` });
            setSingleUser({ _id: '', name: '', email: '', password: '', role: 'FACULTY', department: '', mobile: '', facultyType: 'JUNIOR', facultyGroupName: '' }); // Reset
            setIsEditing(false);
            fetchUsers();
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error("Failed to delete");
            toast.success("User Deleted");
            fetchUsers();
        } catch (err: any) {
            toast.error("Error", { description: err.message });
        }
    };

    const handleEditUser = (user: any) => {
        setSingleUser({
            _id: user._id,
            name: user.name,
            email: user.email,
            password: '', // Leave blank to keep existing
            role: user.role,
            department: user.department || '',
            mobile: user.mobile || '',
            facultyType: user.facultyType || 'JUNIOR',
            facultyGroupName: user.facultyGroupName || ''
        });
        setIsEditing(true);
        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
                facultyType: (row.Type || row.type || row["Faculty Type"] || 'JUNIOR').toUpperCase(),
                facultyGroupName: row.Class || row.class || row.Group || row.group || row["Faculty Group"] || ""
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
                fetchUsers();
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
                    <p className="text-muted-foreground mt-2">Add, edit, or remove faculty, students, and staff.</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column: Forms */}
                    <div className="lg:col-span-1">
                        <Tabs defaultValue="single" className="w-full">
                            <TabsList className="grid w-full grid-cols-2">
                                <TabsTrigger value="single">{isEditing ? 'Edit User' : 'New User'}</TabsTrigger>
                                <TabsTrigger value="bulk">Bulk Upload</TabsTrigger>
                            </TabsList>

                            {/* --- Single User Form --- */}
                            <TabsContent value="single">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>{isEditing ? 'Update User' : 'Add New User'}</CardTitle>
                                        <CardDescription>{isEditing ? `Editing ${singleUser.name}` : 'Manually create account.'}</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <form onSubmit={handleSingleSubmit} className="space-y-4">
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

                                            {singleUser.role === 'STUDENT' && (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-1">
                                                    <label className="text-sm font-medium">Class / Faculty Group</label>
                                                    <SearchableSelect
                                                        options={facultyGroups.map(g => ({ value: g.name, label: g.name }))}
                                                        value={singleUser.facultyGroupName}
                                                        onValueChange={val => setSingleUser({ ...singleUser, facultyGroupName: val })}
                                                        placeholder="Select Faculty Group..."
                                                    />
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
                                                <label className="text-sm font-medium">{isEditing ? 'New Password (Optional)' : 'Default Password'}</label>
                                                <Input
                                                    type="password"
                                                    value={singleUser.password}
                                                    onChange={e => setSingleUser({ ...singleUser, password: e.target.value })}
                                                    placeholder={isEditing ? "Leave blank to keep current" : "Min. 6 characters"}
                                                    required={!isEditing}
                                                />
                                            </div>
                                            <div className="flex flex-col gap-2 pt-2">
                                                <Button className="w-full" disabled={isLoading}>
                                                    {isLoading ? <Loader2 className="animate-spin mr-2" /> : <UserPlus className="mr-2 h-4 w-4" />}
                                                    {isEditing ? 'Update Role' : 'Create Account'}
                                                </Button>
                                                {isEditing && (
                                                    <Button variant="outline" type="button" onClick={() => { setIsEditing(false); setSingleUser({ _id: '', name: '', email: '', password: '', role: 'FACULTY', department: '', mobile: '', facultyType: 'JUNIOR', facultyGroupName: '' }); }}>
                                                        Cancel Edit
                                                    </Button>
                                                )}
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
                                        <CardDescription>Upload Excel/CSV.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="border-2 border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-muted/50 transition-colors">
                                            <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                            <Input
                                                type="file"
                                                accept=".xlsx, .xls, .csv"
                                                className="max-w-xs"
                                                onChange={handleFileUpload}
                                            />
                                        </div>

                                        {bulkData.length > 0 && (
                                            <div className="space-y-2">
                                                <div className="flex items-center justify-between text-sm">
                                                    <span>{bulkData.length} records found</span>
                                                    <Button size="sm" onClick={handleBulkSubmit} disabled={isLoading}>
                                                        Import
                                                    </Button>
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Right Column: User List */}
                    <div className="lg:col-span-2">
                        <Card className="h-full">
                            <CardHeader>
                                <CardTitle>Existing Users</CardTitle>
                                <CardDescription>List of all registered users in the system.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="rounded-md border h-[600px] overflow-auto">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted sticky top-0 z-10">
                                            <tr>
                                                <th className="p-3 text-left font-medium">Name</th>
                                                <th className="p-3 text-left font-medium">Role</th>
                                                <th className="p-3 text-left font-medium">Dept / Class</th>
                                                <th className="p-3 text-right font-medium">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={4} className="p-8 text-center text-muted-foreground">
                                                        No users found. Create one.
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr key={user._id} className="border-t hover:bg-muted/20 transition-colors">
                                                        <td className="p-3">
                                                            <div className="font-medium">{user.name}</div>
                                                            <div className="text-xs text-muted-foreground">{user.email}</div>
                                                        </td>
                                                        <td className="p-3">
                                                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                                user.role === 'HOD' ? 'bg-blue-100 text-blue-800' :
                                                                    'bg-gray-100 text-gray-800'
                                                                }`}>
                                                                {user.role}
                                                            </span>
                                                        </td>
                                                        <td className="p-3 text-muted-foreground">
                                                            <div>{user.department || '-'}</div>
                                                            {user.role === 'STUDENT' && user.facultyGroupName && (
                                                                <div className="text-xs font-semibold text-primary">{user.facultyGroupName}</div>
                                                            )}
                                                        </td>
                                                        <td className="p-3 text-right space-x-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleEditUser(user)}>
                                                                Edit
                                                            </Button>
                                                            <Button variant="ghost" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDeleteUser(user._id)}>
                                                                Delete
                                                            </Button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
