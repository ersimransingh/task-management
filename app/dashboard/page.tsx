import { prisma } from "@/lib/prisma";
import { Board } from "./components/Board";
import { Prisma } from "@prisma/client";

import { getSession } from "@/lib/auth";

interface DashboardPageProps {
    searchParams: Promise<{ q?: string; groupId?: string; assigneeId?: string; priority?: string }>;
}

export default async function DashboardPage({ searchParams }: DashboardPageProps) {
    const session = await getSession();
    if (!session?.user) return <div>Unauthorized</div>;
    const user = session.user;

    const filters = await searchParams;

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

    const where: Prisma.TaskWhereInput = { companyId: user.companyId };

    if (filters.q) {
        where.OR = [
            { title: { contains: filters.q } },
            { description: { contains: filters.q } },
        ];
    }

    if (filters.groupId) {
        where.groupId = filters.groupId;
    }

    if (filters.assigneeId) {
        where.assigneeId = filters.assigneeId === "unassigned" ? null : filters.assigneeId;
    }

    if (filters.priority) {
        where.priority = filters.priority;
    }

    const tasks = await prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
            assignee: true,
            creator: true,
            group: true,
            comments: {
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, name: true } } }
            },
            attachments: {
                orderBy: { createdAt: 'asc' },
                include: { uploadedBy: { select: { id: true, name: true } } }
            },
            activities: {
                orderBy: { createdAt: 'desc' },
                include: { user: { select: { id: true, name: true } } }
            }
        }
    });

    const groups = await prisma.group.findMany({
        where: { companyId: user.companyId },
        orderBy: { name: 'asc' },
        select: { id: true, name: true }
    });

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)]">
            <div className="flex-1 min-h-0">
                <Board
                    initialSections={sections}
                    initialTasks={tasks}
                    currentUserId={user.id}
                    currentUserRole={user.role}
                    groups={groups}
                />
            </div>
        </div>
    )
}
