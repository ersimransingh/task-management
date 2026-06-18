"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Search, SlidersHorizontal, X, Check } from "lucide-react";

interface FilterBarProps {
    users: { id: string; name: string }[];
    groups: { id: string; name: string }[];
}

export function FilterBar({ users, groups }: FilterBarProps) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const dropdownRef = useRef<HTMLDivElement>(null);
    const [isOpen, setIsOpen] = useState(false);

    const [q, setQ] = useState(searchParams.get("q") || "");
    const [groupId, setGroupId] = useState(searchParams.get("groupId") || "");
    const [assigneeId, setAssigneeId] = useState(searchParams.get("assigneeId") || "");
    const [priority, setPriority] = useState(searchParams.get("priority") || "");

    const activeCount = [q, groupId, assigneeId, priority].filter(Boolean).length;

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        }
        if (isOpen) document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [isOpen]);

    const applyFilters = () => {
        const params = new URLSearchParams();
        if (q.trim()) params.set("q", q.trim());
        if (groupId) params.set("groupId", groupId);
        if (assigneeId) params.set("assigneeId", assigneeId);
        if (priority) params.set("priority", priority);

        const query = params.toString();
        router.push(`/dashboard${query ? `?${query}` : ""}`);
        setIsOpen(false);
    };

    const clearFilters = () => {
        setQ("");
        setGroupId("");
        setAssigneeId("");
        setPriority("");
        router.push("/dashboard");
        setIsOpen(false);
    };

    const selectClass =
        "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                onClick={() => setIsOpen(!isOpen)}
                className="gap-2"
            >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeCount > 0 && (
                    <span className="ml-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[10px] font-medium text-primary-foreground">
                        {activeCount}
                    </span>
                )}
            </Button>

            {isOpen && (
                <div className="absolute left-0 top-full z-50 mt-2 w-80 rounded-lg border border-border bg-card p-4 shadow-lg">
                    <div className="space-y-3">
                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Search</label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    value={q}
                                    onChange={(e) => setQ(e.target.value)}
                                    placeholder="Title or description..."
                                    className="pl-9 h-9"
                                    onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Group</label>
                            <select value={groupId} onChange={(e) => setGroupId(e.target.value)} className={selectClass}>
                                <option value="">All groups</option>
                                {groups.map((g) => (
                                    <option key={g.id} value={g.id}>{g.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Assignee</label>
                            <select value={assigneeId} onChange={(e) => setAssigneeId(e.target.value)} className={selectClass}>
                                <option value="">All assignees</option>
                                <option value="unassigned">Unassigned</option>
                                {users.map((u) => (
                                    <option key={u.id} value={u.id}>{u.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-xs font-medium text-muted-foreground">Priority</label>
                            <select value={priority} onChange={(e) => setPriority(e.target.value)} className={selectClass}>
                                <option value="">All priorities</option>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>

                        <div className="flex gap-2 pt-2">
                            <Button onClick={applyFilters} className="flex-1 gap-1">
                                <Check className="h-4 w-4" /> Apply
                            </Button>
                            {activeCount > 0 && (
                                <Button variant="ghost" onClick={clearFilters} className="gap-1">
                                    <X className="h-4 w-4" /> Clear
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
