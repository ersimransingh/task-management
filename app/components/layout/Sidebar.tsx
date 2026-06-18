"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { clsx } from "clsx";
import { LayoutDashboard, Users, Settings, LogOut, CheckSquare, Folder, BarChart3 } from "lucide-react";
import { logoutAction } from "@/app/actions/auth";

interface SidebarProps {
    companyName: string;
    role?: string;
}

export function Sidebar({ companyName = "TaskMaster", role }: SidebarProps) {
    const pathname = usePathname();

    const links = [
        { href: "/dashboard", label: "Tasks", icon: CheckSquare },
        { href: "/dashboard/reports", label: "Reports", icon: BarChart3 },
        ...(role === "ADMIN" ? [
            { href: "/dashboard/groups", label: "Groups", icon: Folder },
            { href: "/dashboard/users", label: "Team", icon: Users },
            { href: "/dashboard/settings", label: "Settings", icon: Settings },
        ] : []),
    ];

    return (
        <div className="flex h-screen w-64 flex-col justify-between border-r border-border bg-card p-4">
            <div className="flex flex-col space-y-4">
                <div className="flex items-center px-2 py-4">
                    <LayoutDashboard className="h-6 w-6 text-primary mr-2" />
                    <span className="text-xl font-bold bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent truncate" title={companyName}>
                        {companyName}
                    </span>
                </div>
                <nav className="flex flex-col space-y-1">
                    {links.map((link) => {
                        const Icon = link.icon;
                        const isActive = pathname === link.href;
                        return (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={clsx(
                                    "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                                    isActive ? "bg-primary/10 text-primary hover:bg-primary/20" : "text-muted-foreground"
                                )}
                            >
                                <Icon className="mr-2 h-4 w-4" />
                                {link.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
            <div className="px-2 py-4 border-t border-border">
                <form action={logoutAction}>
                    <button type="submit" className="flex w-full items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-red-500/10 hover:text-red-500 transition-colors">
                        <LogOut className="mr-2 h-4 w-4" />
                        Sign Out
                    </button>
                </form>
            </div>
        </div>
    );
}
