"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createTask(formData: FormData) {
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;
    const assigneeId = formData.get("assigneeId") as string;

    if (!title) return { error: "Title is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const creator = session.user;

    try {
        await prisma.task.create({
            data: {
                title,
                description,
                priority,
                status: "TODO",
                companyId: creator.companyId,
                creatorId: creator.id,
                assigneeId: assigneeId || null,
            },
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create task" };
    }
}

export async function updateTaskStatus(taskId: string, newStatus: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        await prisma.task.update({
            where: { id: taskId },
            data: { status: newStatus },
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update task status" };
    }
}

export async function updateTask(formData: FormData) {
    const taskId = formData.get("taskId") as string;
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const priority = formData.get("priority") as string;

    if (!taskId || !title) return { error: "Missing fields" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { creatorId: true, companyId: true }
        });

        if (!task) return { error: "Task not found" };

        // Authorization check: Admin OR Creator
        const isCreator = task.creatorId === user.id;
        const isAdmin = user.role === 'ADMIN'; // Wait, session user might not have role up to date if changes. Assuming session has role.
        // Actually our session.user only has id, email, name, companyId usually.
        // We should check the database for current role if we want to be strict, or rely on session if we added role to payload.
        // Let's check DB to be safe for authorization critical path.
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) return { error: "User not found" };

        if (task.companyId !== user.companyId) return { error: "Unauthorized" };

        if (!isCreator && dbUser.role !== 'ADMIN') {
            return { error: "You do not have permission to edit this task." };
        }

        await prisma.task.update({
            where: { id: taskId },
            data: {
                title,
                description,
                priority
            }
        });
        revalidatePath("/dashboard");
        return { success: true };

    } catch (e) {
        console.error(e);
        return { error: "Failed to update task" };
    }
}

export async function deleteTask(formData: FormData) {
    const taskId = formData.get("taskId") as string;

    if (!taskId) return { error: "Task ID is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { creatorId: true, companyId: true }
        });

        if (!task) return { error: "Task not found" };

        if (task.companyId !== user.companyId) return { error: "Unauthorized" };

        // Check if admin or creator
        // Optimization: fetch role if needed, or rely on session if we trust it (we should probably fetch for delete)
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!dbUser) return { error: "User not found" };

        if (task.creatorId !== user.id && dbUser.role !== 'ADMIN') {
            return { error: "You do not have permission to delete this task." };
        }

        await prisma.task.delete({
            where: { id: taskId }
        });

        revalidatePath("/dashboard");
        return { success: true };

    } catch (e) {
        console.error(e);
        return { error: "Failed to delete task" };
    }
}
