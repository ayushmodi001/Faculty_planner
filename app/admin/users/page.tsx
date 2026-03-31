'use client';

import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Loader2, Upload, Search, Mail, Trash2, Edit3, ChevronRight,
    UserCircle2, Users, RefreshCw, Send, Hash, ShieldAlert, Lock
} from 'lucide-react';
import { toast } from 'sonner';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { cn } from '@/lib/utils';

const EMPTY_INVITE = {
    _id: '', name: '', email: '', role: 'FACULTY', department: '',
    mobile: '', facultyType: 'JUNIOR', facultyGroupName: '',
    enrollmentNumber: '', employeeId: '',
};

/** Roles that a viewer is allowed to create / assign */
function getAllowedRolesToCreate(viewerRole: string) {
    if (viewerRole === 'PRINCIPAL') return ['FACULTY', 'STUDENT', 'HOD', 'PRINCIPAL'];
    if (viewerRole === 'HOD') return ['FACULTY', 'STUDENT'];
    return ['FACULTY', 'STUDENT'];
}

/** Can the viewer edit/delete this target user? */
function canMutate(viewerRole: string, targetRole: string, viewerSub: string, targetId: string): boolean {
    if (viewerSub === targetId) return false; // never self-delete
    if (targetRole === 'PRINCIPAL') return viewerRole === 'PRINCIPAL'; // only principal edits principal
    if (targetRole === 'HOD') return viewerRole === 'PRINCIPAL'; // only principal edits HOD
    // HOD can manage FACULTY and STUDENT in their dept (API enforces dept scope)
    return true;
}

export default function UserManagementPage() {
    const [viewer, setViewer] = useState<{ role: string; sub: string; department?: string; department_id?: string } | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [users, setUsers] = useState<any[]>([]);
    const [isEditing, setIsEditing] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [inviteData, setInviteData] = useState({ ...EMPTY_INVITE });
    const [bulkData, setBulkData] = useState<any[]>([]);
    const [fileName, setFileName] = useState('');
    const [departments, setDepartments] = useState<any[]>([]);
    const [resettingId, setResettingId] = useState<string | null>(null);

    useEffect(() => {
        // Fetch session first, then load data
        fetch('/api/user/me')
            .then(r => r.json())
            .then(d => {
                if (d.success) {
                    setViewer({ role: d.user.role, sub: d.user.sub, department: d.user.department, department_id: d.user.department_id });
                    // Pre-fill dept for HOD — they can only invite to their own dept
                    if (d.user.role === 'HOD' && d.user.department) {
                        setInviteData(prev => ({ ...prev, department: d.user.department }));
                    }
                }
            })
            .catch(() => { });
        fetchUsers();
        fetchDepartments();
    }, []);

    const fetchDepartments = async () => {
        try {
            const res = await fetch('/api/admin/departments');
            const data = await res.json();
            if (Array.isArray(data)) setDepartments(data);
        } catch { console.error('Failed to fetch departments'); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch('/api/admin/users');
            const data = await res.json();
            if (data.success) setUsers(data.users);
        } catch { console.error('Failed to fetch users'); }
    };

    // ── Invite (create + send email) ──────────────────────────────────────────
    const handleInviteSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const endpoint = isEditing ? '/api/admin/users' : '/api/admin/invite';
            const method = isEditing ? 'PUT' : 'POST';
            const body = isEditing
                ? { _id: inviteData._id, name: inviteData.name, email: inviteData.email, role: inviteData.role, department: inviteData.department, mobile: inviteData.mobile, facultyType: inviteData.facultyType, facultyGroupName: inviteData.facultyGroupName, enrollmentNumber: inviteData.enrollmentNumber, employeeId: inviteData.employeeId }
                : inviteData;

            const res = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Operation failed');

            if (!isEditing && data.warning) {
                toast.warning(data.warning);
                if (data.tempPassword) {
                    toast.info(`Temp password: ${data.tempPassword}`, { duration: 15000 });
                }
            } else {
                toast.success(isEditing ? 'User updated' : `Invite sent to ${inviteData.email}`);
            }

            // Reset form — but keep HOD dept locked
            const deptReset = viewer?.role === 'HOD' ? viewer.department || '' : '';
            setInviteData({ ...EMPTY_INVITE, department: deptReset });
            setIsEditing(false);
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    // ── Send password reset request email ─────────────────────────────────────
    const handleSendReset = async (userId: string, userName: string) => {
        if (!confirm(`Send a password reset email to ${userName}?`)) return;
        setResettingId(userId);
        try {
            const res = await fetch('/api/admin/reset-request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error);
            if (data.warning) toast.warning(data.warning);
            else toast.success(`Reset email sent to ${userName}`);
        } catch (err: any) {
            toast.error(err.message || 'Failed to send reset email');
        } finally {
            setResettingId(null);
        }
    };

    const handleDeleteUser = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            const res = await fetch(`/api/admin/users?id=${id}`, { method: 'DELETE' });
            if (!res.ok) throw new Error('Deletion failed');
            toast.success('User deleted');
            fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        }
    };

    const handleEditUser = (user: any) => {
        setInviteData({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            department: user.department || '',
            mobile: user.mobile || '',
            facultyType: user.facultyType || 'JUNIOR',
            facultyGroupName: user.facultyGroupName || '',
            enrollmentNumber: user.enrollmentNumber || '',
            employeeId: user.employeeId || '',
        });
        setIsEditing(true);
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
            const ws = wb.Sheets[wb.SheetNames[0]];
            const data = XLSX.utils.sheet_to_json(ws);
            setBulkData(data);
            toast.info('File loaded', { description: `Found ${data.length} users` });
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkSubmit = async () => {
        if (bulkData.length === 0) return;
        setIsLoading(true);
        try {
            const formatted = bulkData.map((row: any) => ({
                name: row.Name || row.name,
                email: row.Email || row.email,
                password: row.Password || row.password || 'Welcome@123',
                role: (row.Role || row.role || 'STUDENT').toUpperCase(),
                department: row.Department || row.department,
                mobile: String(row.Mobile || row.mobile || ''),
                facultyType: (row.Type || row["Faculty Type"] || 'JUNIOR').toUpperCase(),
                facultyGroupName: row.Class || row.Group || row["Faculty Group"] || '',
                enrollmentNumber: String(row.EnrollmentNumber || row['Enrollment Number'] || row.enrollment_number || ''),
                employeeId: String(row.EmployeeId || row['Employee ID'] || row.employee_id || ''),
            }));
            const res = await fetch('/api/admin/users', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formatted),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Batch upload failed');
            toast.success('Import complete', { description: `Created ${data.createdCount} users.` });
            setBulkData([]); setFileName(''); fetchUsers();
        } catch (err: any) {
            toast.error(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    const filteredUsers = users
        .sort((a, b) => a.name.localeCompare(b.name))
        .filter(u =>
            u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.department || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.enrollmentNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
            (u.employeeId || '').toLowerCase().includes(searchQuery.toLowerCase())
        );

    const roleBadge = (role: string) => {
        const map: Record<string, string> = {
            FACULTY: 'bg-blue-50 text-blue-700',
            STUDENT: 'bg-green-50 text-green-700',
            HOD: 'bg-purple-50 text-purple-700',
            PRINCIPAL: 'bg-orange-50 text-orange-700',
            ADMIN: 'bg-red-50 text-red-700',
        };
        return map[role] || 'bg-slate-50 text-slate-600';
    };

    const allowedCreatableRoles = getAllowedRolesToCreate(viewer?.role ?? '');

    return (
        <DashboardLayout role={viewer?.role === 'PRINCIPAL' ? 'Principal' : 'Admin'} departmentName={viewer?.department}>
            <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-foreground tracking-tight">User Management</h1>
                        <p className="text-muted-foreground text-sm mt-1">
                            {viewer?.role === 'HOD'
                                ? `Managing users in ${viewer.department ?? 'your department'}`
                                : 'Invite faculty & students. Manage existing accounts.'}
                        </p>
                    </div>
                    {viewer?.role === 'HOD' && viewer.department && (
                        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20">
                            <ShieldAlert className="w-4 h-4 text-primary" />
                            <span className="text-xs font-black text-primary uppercase tracking-wider">{viewer.department} dept</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* ── Form Column ── */}
                    <div className="lg:col-span-4 space-y-6">
                        <Card className="shadow-sm border-border overflow-hidden rounded-3xl">
                            <Tabs defaultValue="invite" className="w-full gap-0">
                                <div className="p-1 px-1.5 bg-muted/30 border-b">
                                    <TabsList className="grid w-full grid-cols-2 h-8 p-1 bg-muted/60 rounded-md">
                                        <TabsTrigger value="invite" className="text-[10px] font-black uppercase tracking-widest">{isEditing ? 'Edit' : 'Invite'}</TabsTrigger>
                                        <TabsTrigger value="bulk" className="text-[10px] font-black uppercase tracking-widest">Import</TabsTrigger>
                                    </TabsList>
                                </div>

                                {/* ── Single Invite Tab ── */}
                                <TabsContent value="invite" className="p-5 space-y-4 mt-0">
                                    <div className="flex items-center gap-2 pb-1 border-b border-border/50">
                                        <Send className="w-3.5 h-3.5 text-primary" />
                                        <h3 className="font-black text-foreground uppercase tracking-tight text-[10px]">{isEditing ? 'Update Account' : 'Send User Invite'}</h3>
                                    </div>
                                    {!isEditing && (
                                        <p className="text-[10px] text-muted-foreground bg-primary/5 border border-primary/10 rounded-xl p-3">
                                            An email with a temporary password will be sent. The user must change it on first login.
                                        </p>
                                    )}
                                    <form onSubmit={handleInviteSubmit} className="space-y-3">
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Full Name</label>
                                            <Input placeholder="Jane Smith" value={inviteData.name} onChange={e => setInviteData({ ...inviteData, name: e.target.value })} required />
                                        </div>
                                        <div className="space-y-1.5">
                                            <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Institutional Email</label>
                                            <Input type="email" placeholder="jane@university.edu" value={inviteData.email} onChange={e => setInviteData({ ...inviteData, email: e.target.value })} required disabled={isEditing} />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Role</label>
                                                <Select value={inviteData.role} onValueChange={val => setInviteData({ ...inviteData, role: val })}>
                                                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        {allowedCreatableRoles.map(r => (
                                                            <SelectItem key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Department</label>
                                                {/* HOD: locked to their own department */}
                                                {viewer?.role === 'HOD' ? (
                                                    <div className="flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-muted/30">
                                                        <Lock className="w-3 h-3 text-muted-foreground/40" />
                                                        <span className="text-sm font-black text-foreground/70 truncate">{viewer.department}</span>
                                                    </div>
                                                ) : (
                                                    <Select value={inviteData.department} onValueChange={val => setInviteData({ ...inviteData, department: val })}>
                                                        <SelectTrigger className="text-sm"><SelectValue placeholder="Select" /></SelectTrigger>
                                                        <SelectContent>
                                                            {departments.map((d: any) => <SelectItem key={d._id} value={d.name}>{d.name}</SelectItem>)}
                                                        </SelectContent>
                                                    </Select>
                                                )}
                                            </div>
                                        </div>

                                        {inviteData.role === 'STUDENT' && (
                                            <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3" /> Enrollment Number</label>
                                                <Input placeholder="e.g. 2021CS001" value={inviteData.enrollmentNumber} onChange={e => setInviteData({ ...inviteData, enrollmentNumber: e.target.value })} />
                                            </div>
                                        )}
                                        {(inviteData.role === 'FACULTY' || inviteData.role === 'HOD') && (
                                            <div className="space-y-1.5 animate-in slide-in-from-top-2">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest flex items-center gap-1"><Hash className="w-3 h-3" /> Employee ID</label>
                                                <Input placeholder="e.g. FAC-042" value={inviteData.employeeId} onChange={e => setInviteData({ ...inviteData, employeeId: e.target.value })} />
                                            </div>
                                        )}

                                        {inviteData.role === 'FACULTY' && (
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Faculty Type</label>
                                                <Select value={inviteData.facultyType} onValueChange={val => setInviteData({ ...inviteData, facultyType: val })}>
                                                    <SelectTrigger className="text-sm"><SelectValue /></SelectTrigger>
                                                    <SelectContent>
                                                        <SelectItem value="JUNIOR">Junior</SelectItem>
                                                        <SelectItem value="SENIOR">Senior</SelectItem>
                                                    </SelectContent>
                                                </Select>
                                            </div>
                                        )}

                                        <div className="pt-2 flex flex-col gap-2">
                                            <Button className="w-full h-11 font-black uppercase tracking-widest text-[10px] gap-2" disabled={isLoading}>
                                                {isLoading ? <Loader2 className="animate-spin h-4 w-4" /> : isEditing ? <Edit3 className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                                                {isEditing ? 'Update User' : 'Send Invite Email'}
                                            </Button>
                                            {isEditing && (
                                                <Button type="button" variant="ghost" className="text-xs font-black text-muted-foreground" onClick={() => {
                                                    setIsEditing(false);
                                                    const deptReset = viewer?.role === 'HOD' ? viewer.department || '' : '';
                                                    setInviteData({ ...EMPTY_INVITE, department: deptReset });
                                                }}>
                                                    Cancel
                                                </Button>
                                            )}
                                        </div>
                                    </form>
                                </TabsContent>

                                {/* ── Bulk Import Tab ── */}
                                <TabsContent value="bulk" className="p-5 space-y-3 mt-0">
                                    <h3 className="font-bold uppercase tracking-tight text-sm">Bulk Import (Excel/CSV)</h3>
                                    <p className="text-[10px] text-muted-foreground">Columns: Name, Email, Password, Role, Department, Mobile, Type, Class, EnrollmentNumber, EmployeeId</p>
                                    <div className="border border-dashed border-border rounded-xl p-6 flex flex-col items-center bg-muted/10 relative group hover:bg-muted/20 transition-colors">
                                        <Upload className="h-8 w-8 text-muted-foreground/30 mb-3 group-hover:text-primary transition-colors" />
                                        <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider mb-4">{fileName || 'Select Excel or CSV file'}</p>
                                        <Input type="file" accept=".xlsx,.xls,.csv" className="absolute inset-0 opacity-0 cursor-pointer" onChange={handleFileUpload} />
                                        <Button variant="outline" className="text-[10px] font-bold uppercase pointer-events-none">Choose File</Button>
                                    </div>
                                    {bulkData.length > 0 && (
                                        <div className="bg-secondary p-4 rounded-xl flex justify-between items-center text-secondary-foreground">
                                            <div>
                                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Ready</p>
                                                <p className="text-xl font-bold">{bulkData.length} Users</p>
                                            </div>
                                            <Button size="icon" className="h-10 w-10" onClick={handleBulkSubmit} disabled={isLoading}>
                                                <ChevronRight className="w-5 h-5" />
                                            </Button>
                                        </div>
                                    )}
                                </TabsContent>
                            </Tabs>
                        </Card>

                        <div className="p-6 bg-primary rounded-2xl text-primary-foreground shadow-lg shadow-primary/20 flex items-center gap-4">
                            <Users className="w-8 h-8 text-primary-foreground/30" />
                            <div>
                                <h4 className="font-black text-lg tracking-tight">Quick Insight</h4>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-primary-foreground/70">Total users: {users.length}</p>
                            </div>
                        </div>
                    </div>

                    {/* ── Registry Column ── */}
                    <div className="lg:col-span-8 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
                            <Input
                                placeholder="Search by name, email, department, ID number..."
                                className="pl-11 h-11 text-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Card className="shadow-sm border-border overflow-hidden rounded-3xl">
                            <CardHeader className="py-4 px-6 border-b bg-muted/20">
                                <CardTitle className="text-sm font-black uppercase tracking-widest text-muted-foreground">User Registry</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="divide-y divide-border/40">
                                    {filteredUsers.length === 0 ? (
                                        <div className="py-20 text-center space-y-2">
                                            <UserCircle2 className="w-10 h-10 text-muted-foreground/20 mx-auto" />
                                            <p className="text-sm font-medium text-muted-foreground">No users found.</p>
                                        </div>
                                    ) : filteredUsers.map((user) => {
                                        const mutable = viewer ? canMutate(viewer.role, user.role, viewer.sub, user._id) : false;
                                        return (
                                            <div key={user._id} className="px-6 py-3.5 flex items-center justify-between hover:bg-muted/30 transition-all group">
                                                <div className="flex items-center gap-4 overflow-hidden min-w-0">
                                                    <div className={cn(
                                                        "w-10 h-10 rounded-2xl flex items-center justify-center font-black shrink-0 text-sm transition-all duration-300",
                                                        user.isInvitePending ? 'bg-amber-100 text-amber-600' : 'bg-muted text-muted-foreground group-hover:bg-primary group-hover:text-primary-foreground'
                                                    )}>
                                                        {user.isInvitePending ? <Mail className="w-4 h-4" /> : user.name.charAt(0)}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <p className="font-bold text-foreground text-sm truncate leading-none group-hover:text-primary transition-colors">{user.name}</p>
                                                            {user.isInvitePending && <span className="text-[8px] font-black uppercase bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-full shrink-0">Pending</span>}
                                                            {user.mustChangePassword && <span className="text-[8px] font-black uppercase bg-red-100 text-red-600 px-1.5 py-0.5 rounded-full shrink-0">Must Reset</span>}
                                                        </div>
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <p className="text-[10px] text-muted-foreground truncate">{user.email}</p>
                                                            <span className={cn("text-[8px] font-black uppercase px-2 py-0.5 rounded-full", roleBadge(user.role))}>{user.role}</span>
                                                            {user.department && <span className="text-[9px] text-muted-foreground/70 font-medium">{user.department}</span>}
                                                            {user.enrollmentNumber && <span className="text-[9px] font-mono text-muted-foreground/60">#{user.enrollmentNumber}</span>}
                                                            {user.employeeId && <span className="text-[9px] font-mono text-muted-foreground/60">#{user.employeeId}</span>}
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Action buttons — only shown if the viewer can mutate this user */}
                                                {mutable ? (
                                                    <div className="flex items-center gap-1 shrink-0 ml-4 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-amber-600" title="Send Password Reset Email"
                                                            onClick={() => handleSendReset(user._id, user.name)} disabled={resettingId === user._id}>
                                                            {resettingId === user._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-primary" onClick={() => handleEditUser(user)}>
                                                            <Edit3 className="w-4 h-4" />
                                                        </Button>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => handleDeleteUser(user._id)}>
                                                            <Trash2 className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    /* Show lock icon for protected accounts (Principal, HOD when viewer is HOD) */
                                                    <div className="flex items-center ml-4 opacity-0 group-hover:opacity-100 transition-all">
                                                        <Lock className="w-3.5 h-3.5 text-muted-foreground/30" />
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
