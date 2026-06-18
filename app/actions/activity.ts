"use server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";

export interface ActivityInput {
    action: string;
    taskId: string;
    userId: string;
    fromSectionId?: string | null;
    toSectionId?: string | null;
    metadata?: string;
}

export async function logActivity(data: ActivityInput) {
    try {
        await prisma.taskActivity.create({
            data: {
                action: data.action,
                taskId: data.taskId,
                userId: data.userId,
                fromSectionId: data.fromSectionId || null,
                toSectionId: data.toSectionId || null,
                metadata: data.metadata || null,
            },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

export async function getActivitiesForTask(taskId: string) {
    const session = await getSession();
    if (!session?.user) return [];

    return prisma.taskActivity.findMany({
        where: { taskId },
        orderBy: { createdAt: "desc" },
        include: { user: { select: { id: true, name: true } } },
    });
}

export async function getRecentActivities(companyId: string, limit = 100) {
    const session = await getSession();
    if (!session?.user) return [];

    return prisma.taskActivity.findMany({
        where: { task: { companyId } },
        orderBy: { createdAt: "desc" },
        take: limit,
        include: {
            user: { select: { id: true, name: true } },
            task: { select: { id: true, title: true } },
        },
    });
}

export async function getActivityStats(companyId: string) {
    const session = await getSession();
    if (!session?.user) return null;

    const [
        totalActivities,
        actionCounts,
        userActivity,
        moveActivities,
    ] = await Promise.all([
        prisma.taskActivity.count({ where: { task: { companyId } } }),
        prisma.taskActivity.groupBy({
            by: ["action"],
            where: { task: { companyId } },
            _count: { action: true },
        }),
        prisma.taskActivity.groupBy({
            by: ["userId"],
            where: { task: { companyId } },
            _count: { userId: true },
            orderBy: { _count: { userId: "desc" } },
            take: 10,
        }),
        prisma.taskActivity.findMany({
            where: { task: { companyId }, action: "MOVE" },
            orderBy: { createdAt: "desc" },
            take: 50,
            include: {
                user: { select: { id: true, name: true } },
                task: { select: { id: true, title: true } },
            },
        }),
    ]);

    const userIds = userActivity.map((u) => u.userId);
    const users = await prisma.user.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true },
    });
    const userMap = new Map(users.map((u) => [u.id, u.name]));

    return {
        totalActivities,
        actionCounts,
        userActivity: userActivity.map((u) => ({
            userId: u.userId,
            userName: userMap.get(u.userId) || "Unknown",
            count: u._count.userId,
        })),
        moveActivities,
    };
}
