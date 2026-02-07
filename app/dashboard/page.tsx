import { prisma } from "@/lib/prisma";
import { CreateTaskButton } from "./components/CreateTaskButton";
import { Board } from "./components/Board";

import { getSession } from "@/lib/auth";

export default async function DashboardPage() {
    const session = await getSession();
    if (!session?.user) return <div>Unauthorized</div>;
    const user = session.user;

    // Ensure default sections exist
    const existingSections = await prisma.section.count({ where: { companyId: user.companyId } });
    if (existingSections === 0) {
        await prisma.section.createMany({
            data: [
                { title: "To Do", order: 0, companyId: user.companyId },
                { title: "In Progress", order: 1, companyId: user.companyId },
                { title: "Review", order: 2, companyId: user.companyId },
                { title: "Done", order: 3, companyId: user.companyId },
            ]
        });
    }

    const sections = await prisma.section.findMany({
        where: { companyId: user.companyId },
        orderBy: { order: 'asc' }
    });

    const tasks = await prisma.task.findMany({
        where: { companyId: user.companyId },
        orderBy: { createdAt: 'desc' },
        include: { assignee: true, creator: true }
    });

    // Simple migration in-memory or on-the-fly: map status to sections if sectionId is null
    // But wait, we just created sections. We can try to map them once.
    // Ideally, we'd run a background job. For now, let's just let them land in "Backlog" / Unassigned column defined in Board.ts,
    // OR we assume unassigned tasks go to the first section.

    // Let's passed them as is. The Board handles "unassigned" as a specific column.

    const users = await prisma.user.findMany({
        select: { id: true, name: true }
    });

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] space-y-4">
            <div className="flex items-center justify-between shrink-0">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Board</h1>
                    <p className="text-muted-foreground">Drag and drop tasks to manage workflow.</p>
                </div>
                <div className="flex gap-2">
                    <CreateTaskButton users={users} />
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <Board initialSections={sections} initialTasks={tasks} currentUserId={user.id} currentUserRole={user.role} />
            </div>
        </div>
    )
}

