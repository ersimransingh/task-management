"use client";

import { useState } from "react";
import { updateTaskStatus } from "@/app/actions/tasks";
import { Loader2 } from "lucide-react";

export function TaskStatusSelect({ taskId, currentStatus }: { taskId: string, currentStatus: string }) {
    const [isLoading, setIsLoading] = useState(false);

    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newStatus = e.target.value;
        setIsLoading(true);
        await updateTaskStatus(taskId, newStatus);
        setIsLoading(false);
    };

    const statusColors: Record<string, string> = {
        TODO: "bg-zinc-800 text-zinc-300 border-zinc-700",
        IN_PROGRESS: "bg-blue-500/10 text-blue-500 border-blue-500/20",
        QA: "bg-purple-500/10 text-purple-500 border-purple-500/20",
        DONE: "bg-green-500/10 text-green-500 border-green-500/20",
    };

    return (
        <div className="relative inline-flex items-center">
            {isLoading && <Loader2 className="absolute left-2 h-3 w-3 animate-spin text-muted-foreground" />}
            <select
                defaultValue={currentStatus}
                onChange={handleStatusChange}
                disabled={isLoading}
                className={`h-7 rounded-full border px-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 appearance-none pl-2 pr-6 cursor-pointer ${statusColors[currentStatus] || statusColors.TODO
                    }`}
            >
                <option value="TODO" className="bg-card text-foreground">Todo</option>
                <option value="IN_PROGRESS" className="bg-card text-foreground">In Progress</option>
                <option value="QA" className="bg-card text-foreground">QA</option>
                <option value="DONE" className="bg-card text-foreground">Done</option>
            </select>
            <div className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
            </div>
        </div>
    );
}
