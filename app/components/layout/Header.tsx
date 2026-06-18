"use client";

import { usePathname } from "next/navigation";
import { Building2 } from "lucide-react";
import { FilterBar } from "@/app/dashboard/components/FilterBar";
import { CreateSectionButton } from "@/app/dashboard/components/CreateSectionButton";
import { CreateTaskButton } from "@/app/dashboard/components/CreateTaskButton";

interface HeaderProps {
    user: {
        name: string;
        role: string;
    };
    companyName: string;
    users: { id: string; name: string }[];
    groups: { id: string; name: string }[];
}

const pageTitles: Record<string, string> = {
    "/dashboard": "Board",
    "/dashboard/groups": "Groups",
    "/dashboard/users": "Team",
    "/dashboard/settings": "Settings",
    "/dashboard/reports": "Reports",
};

export function Header({ user, companyName, users, groups }: HeaderProps) {
    const pathname = usePathname();
    const pageTitle = pageTitles[pathname] || "Dashboard";
    const isBoardPage = pathname === "/dashboard";

    return (
        <div className="flex items-center justify-between px-8 py-4 border-b border-border bg-card/50">
            <div className="flex items-center gap-4">
                <h1 className="text-xl font-semibold tracking-tight min-w-[120px]">{pageTitle}</h1>
                {isBoardPage && (
                    <div className="flex items-center gap-2">
                        <FilterBar users={users} groups={groups} />
                        {user.role === "ADMIN" && <CreateSectionButton />}
                        <CreateTaskButton users={users} groups={groups} />
                    </div>
                )}
            </div>

            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium leading-none text-foreground">{user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {companyName || "Company"}
                    </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {user.name.charAt(0)}
                </div>
            </div>
        </div>
    );
}
