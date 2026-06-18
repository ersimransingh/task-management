import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { getRecentActivities, getActivityStats } from "@/app/actions/activity";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Activity, ArrowRightLeft, Users, BarChart3, FileText, MessageSquare } from "lucide-react";

interface ActivityUser {
    id: string;
    name: string;
}

interface ActivityTask {
    id: string;
    title: string;
}

interface RecentActivity {
    id: string;
    action: string;
    fromSectionId: string | null;
    toSectionId: string | null;
    createdAt: Date;
    user: ActivityUser | null;
    task: ActivityTask | null;
}

interface ActionCount {
    action: string;
    _count: { action: number };
}

interface UserActivity {
    userId: string;
    userName: string;
    count: number;
}

interface MoveActivity {
    id: string;
    fromSectionId: string | null;
    toSectionId: string | null;
    createdAt: Date;
    user: ActivityUser | null;
    task: ActivityTask | null;
}

interface ActivityStats {
    totalActivities: number;
    actionCounts: ActionCount[];
    userActivity: UserActivity[];
    moveActivities: MoveActivity[];
}

export default async function ReportsPage() {
    const session = await getSession();
    if (!session?.user) return <div>Unauthorized</div>;

    const companyId = session.user.companyId;

    const [recentActivities, stats] = await Promise.all([
        getRecentActivities(companyId, 50),
        getActivityStats(companyId),
    ]);

    const sections = await prisma.section.findMany({
        where: { companyId },
        select: { id: true, title: true },
    });
    const sectionMap: Record<string, string> = Object.fromEntries(sections.map((s) => [s.id, s.title]));

    const actionIcon: Record<string, React.ReactNode> = {
        CREATE: <FileText className="h-4 w-4" />,
        UPDATE: <FileText className="h-4 w-4" />,
        MOVE: <ArrowRightLeft className="h-4 w-4" />,
        DELETE: <FileText className="h-4 w-4" />,
        COMMENT: <MessageSquare className="h-4 w-4" />,
        COMMENT_DELETE: <MessageSquare className="h-4 w-4" />,
        ATTACHMENT_ADD: <FileText className="h-4 w-4" />,
        ATTACHMENT_DELETE: <FileText className="h-4 w-4" />,
    };

    function activityText(activity: RecentActivity) {
        const user = activity.user?.name || "Unknown";
        const task = activity.task?.title || "Untitled";

        switch (activity.action) {
            case "CREATE":
                return `${user} created task "${task}"`;
            case "UPDATE":
                return `${user} updated task "${task}"`;
            case "MOVE": {
                const from = activity.fromSectionId ? sectionMap[activity.fromSectionId] || "Unknown" : "Backlog";
                const to = activity.toSectionId ? sectionMap[activity.toSectionId] || "Unknown" : "Backlog";
                return `${user} moved "${task}" from ${from} to ${to}`;
            }
            case "DELETE":
                return `${user} deleted task "${task}"`;
            case "COMMENT":
                return `${user} commented on "${task}"`;
            case "COMMENT_DELETE":
                return `${user} deleted a comment on "${task}"`;
            case "ATTACHMENT_ADD":
                return `${user} attached a file to "${task}"`;
            case "ATTACHMENT_DELETE":
                return `${user} removed an attachment from "${task}"`;
            default:
                return `${user} performed ${activity.action} on "${task}"`;
        }
    }

    const safeStats: ActivityStats | null = stats as ActivityStats | null;

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
                <p className="text-muted-foreground">Track task activity, movements, and team contributions.</p>
            </div>

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Activities</CardTitle>
                        <Activity className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{safeStats?.totalActivities || 0}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Task Moves</CardTitle>
                        <ArrowRightLeft className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {safeStats?.actionCounts.find((a) => a.action === "MOVE")?._count.action || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Comments</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {safeStats?.actionCounts.find((a) => a.action === "COMMENT")?._count.action || 0}
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Top Contributor</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-lg font-bold truncate">
                            {safeStats?.userActivity[0]?.userName || "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                            {safeStats?.userActivity[0]?.count || 0} activities
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
                {/* Activity Feed */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Activity className="h-5 w-5 text-primary" />
                            Recent Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {recentActivities.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">No activity recorded yet.</p>
                            )}
                            {recentActivities.map((activity: RecentActivity) => (
                                <div key={activity.id} className="flex gap-3 text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                                    <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                                        {actionIcon[activity.action] || <BarChart3 className="h-3.5 w-3.5" />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-foreground">{activityText(activity)}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {new Date(activity.createdAt).toLocaleString()}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* User Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Users className="h-5 w-5 text-primary" />
                            User Activity
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {safeStats?.userActivity.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">No user activity yet.</p>
                            )}
                            {safeStats?.userActivity.map((user, index) => (
                                <div key={user.userId} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="h-7 w-7 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium">{user.userName}</span>
                                    </div>
                                    <span className="text-sm text-muted-foreground">{user.count} activities</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Movements */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <ArrowRightLeft className="h-5 w-5 text-primary" />
                            Recent Task Movements
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {safeStats?.moveActivities.length === 0 && (
                                <p className="text-sm text-muted-foreground text-center py-8">No task movements recorded yet.</p>
                            )}
                            {safeStats?.moveActivities.map((activity) => {
                                const from = activity.fromSectionId ? sectionMap[activity.fromSectionId] || "Unknown" : "Backlog";
                                const to = activity.toSectionId ? sectionMap[activity.toSectionId] || "Unknown" : "Backlog";
                                return (
                                    <div key={activity.id} className="flex items-center justify-between text-sm border-b border-border last:border-0 pb-3 last:pb-0">
                                        <div>
                                            <span className="font-medium">{activity.user?.name || "Unknown"}</span>{" "}
                                            moved{" "}
                                            <span className="font-medium">{activity.task?.title || "Untitled"}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                            <span>{from}</span>
                                            <ArrowRightLeft className="h-3 w-3" />
                                            <span>{to}</span>
                                            <span className="ml-2">{new Date(activity.createdAt).toLocaleString()}</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
