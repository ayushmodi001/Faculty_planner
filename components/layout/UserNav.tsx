'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LogOut, Settings, User as UserIcon } from 'lucide-react';

interface UserInfo {
    name: string;
    email: string;
    role: string;
    department?: string;
    facultyType?: string;
}

function getRoleLabel(role: string, facultyType?: string) {
    switch (role) {
        case 'PRINCIPAL': return 'Principal';
        case 'HOD': return 'Head of Department';
        case 'FACULTY': return facultyType === 'SENIOR' ? 'Senior Faculty' : 'Faculty';
        case 'STUDENT': return 'Student';
        default: return role;
    }
}

function getInitials(name: string) {
    return name
        .split(' ')
        .map(n => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
}

export default function UserNav() {
    const [user, setUser] = useState<UserInfo | null>(null);

    useEffect(() => {
        fetch('/api/user/me')
            .then(r => r.json())
            .then(d => { if (d.success) setUser(d.user); })
            .catch(() => { });
    }, []);

    const handleLogout = async () => {
        await fetch('/api/auth/logout', { method: 'POST' });
        window.location.href = '/login';
    };

    if (!user) {
        // Skeleton while loading
        return (
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        );
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="relative flex items-center gap-2.5 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 group">
                    <Avatar className="h-9 w-9 border-2 border-border group-hover:border-primary transition-colors cursor-pointer">
                        <AvatarFallback className="bg-primary text-primary-foreground text-[11px] font-black">
                            {getInitials(user.name)}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-56 rounded-2xl shadow-xl border-border/60 p-1" align="end" sideOffset={8}>
                {/* User info header */}
                <DropdownMenuLabel className="p-3 pb-2">
                    <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10 border border-border">
                            <AvatarFallback className="bg-primary/10 text-primary text-sm font-black">
                                {getInitials(user.name)}
                            </AvatarFallback>
                        </Avatar>
                        <div className="min-w-0 flex-1">
                            <p className="text-sm font-bold text-foreground truncate leading-tight">{user.name}</p>
                            <p className="text-[10px] text-muted-foreground font-medium truncate mt-0.5">{user.email}</p>
                            <p className="text-[10px] text-primary font-black uppercase tracking-widest mt-1">
                                {getRoleLabel(user.role, user.facultyType)}
                                {user.department ? ` · ${user.department}` : ''}
                            </p>
                        </div>
                    </div>
                </DropdownMenuLabel>

                <DropdownMenuSeparator className="mx-1" />

                <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                        <Link href="/settings" className="flex items-center gap-2 rounded-xl px-3 py-2 cursor-pointer">
                            <Settings className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Settings</span>
                        </Link>
                    </DropdownMenuItem>
                </DropdownMenuGroup>

                <DropdownMenuSeparator className="mx-1" />

                <DropdownMenuItem
                    onClick={handleLogout}
                    className="flex items-center gap-2 rounded-xl px-3 py-2 text-rose-600 focus:text-rose-600 focus:bg-rose-50 cursor-pointer"
                >
                    <LogOut className="w-4 h-4" />
                    <span className="text-sm font-medium">Sign Out</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
