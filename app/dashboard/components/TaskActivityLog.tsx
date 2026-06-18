"use client";

import { Activity, MessageSquare, Paperclip, ArrowRightLeft, Plus, Pencil, Trash } from "lucide-react";

interface ActivityItem {
    id: string;
    action: string;
    user: { name: string };
    fromSectionId?: string | null;
    toSectionId?: string | null;
    metadata?: string | null;
    createdAt: string;
}

interface TaskActivityLogProps {
    activities: ActivityItem[];
    sectionMap?: Record<string, string>;
}

const actionIcons: Record<string, React.ReactNode> = {
    CREATE: <Plus className="h-3.5 w-3.5" />,
    UPDATE: <Pencil className="h-3.5 w-3.5" />,
    MOVE: <ArrowRightLeft className="h-3.5 w-3.5" />,
    DELETE: <Trash className="h-3.5 w-3.5" />,
    COMMENT: <MessageSquare className="h-3.5 w-3.5" />,
    COMMENT_DELETE: <MessageSquare className="h-3.5 w-3.5" />,
    ATTACHMENT_ADD: <Paperclip className="h-3.5 w-3.5" />,
    ATTACHMENT_DELETE: <Paperclip className="h-3.5 w-3.5" />,
};

const actionLabels: Record<string, string> = {
    CREATE: "created the task",
    UPDATE: "updated the task",
    MOVE: "moved the task",
    DELETE: "deleted the task",
    COMMENT: "added a comment",
    COMMENT_DELETE: "deleted a comment",
    ATTACHMENT_ADD: "added an attachment",
    ATTACHMENT_DELETE: "deleted an attachment",
};

function formatActivity(activity: ActivityItem, sectionMap: Record<string, string>) {
    const label = actionLabels[activity.action] || activity.action.toLowerCase();

    if (activity.action === "MOVE") {
        const from = activity.fromSectionId ? sectionMap[activity.fromSectionId] || "Unknown" : "Backlog";
        const to = activity.toSectionId ? sectionMap[activity.toSectionId] || "Unknown" : "Backlog";
        return `${label} from ${from} to ${to}`;
    }

    if (activity.metadata) {
        try {
            const meta = JSON.parse(activity.metadata);
            if (activity.action === "COMMENT" || activity.action === "COMMENT_DELETE") {
                return `${label}: "${meta.content}"`;
            }
            if (activity.action === "ATTACHMENT_ADD" || activity.action === "ATTACHMENT_DELETE") {
                return `${label}: ${meta.fileName}`;
            }
        } catch {
            // ignore
        }
    }

    return label;
}

export function TaskActivityLog({ activities, sectionMap = {} }: TaskActivityLogProps) {
    if (activities.length === 0) {
        return (
            <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" /> Activity
                </label>
                <p className="text-sm text-muted-foreground py-2">No activity yet.</p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Activity className="h-4 w-4" /> Activity
            </label>
            <div className="space-y-3">
                {activities.map((activity) => (
                    <div key={activity.id} className="flex gap-3 text-sm">
                        <div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                            {actionIcons[activity.action] || <Activity className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex-1">
                            <p className="text-foreground">
                                <span className="font-medium">{activity.user.name}</span>{" "}
                                {formatActivity(activity, sectionMap)}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {new Date(activity.createdAt).toLocaleString()}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
