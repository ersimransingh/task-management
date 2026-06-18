"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logActivity } from "./activity";

export async function createSection(formData: FormData) {
    const title = formData.get("title") as string;
    if (!title) return { error: "Title is required" };

    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        if (session.user.role !== "ADMIN") return { error: "Only admins can create sections" };

        // Get max order
        const lastSection = await prisma.section.findFirst({
            where: { companyId: session.user.companyId },
            orderBy: { order: 'desc' }
        });

        await prisma.section.create({
            data: {
                title,
                companyId: session.user.companyId,
                order: (lastSection?.order ?? 0) + 1
            }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create section" };
    }
}

export async function reorderSections(items: { id: string, order: number }[]) {
    try {
        const session = await getSession();
        if (!session?.user || session.user.role !== "ADMIN") return { error: "Unauthorized" };

        // Using a transaction would be better but simple update loop works for now for small numbers
        // Ideally:
        // await prisma.$transaction(
        //    items.map(item => prisma.section.update({ where: { id: item.id }, data: { order: item.order } }))
        // );

        for (const item of items) {
            await prisma.section.update({
                where: { id: item.id },
                data: { order: item.order }
            });
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        return { error: "Failed to reorder" };
    }
}

export async function moveTask(taskId: string, newSectionId: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };
        const user = session.user;

        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { companyId: true, sectionId: true }
        });

        if (!task) return { error: "Task not found" };
        if (task.companyId !== user.companyId) return { error: "Unauthorized" };

        const fromSectionId = task.sectionId;
        const toSectionId = newSectionId || null;

        await prisma.task.update({
            where: { id: taskId },
            data: { sectionId: toSectionId }
        });

        if (fromSectionId !== toSectionId) {
            await logActivity({
                action: "MOVE",
                taskId,
                userId: user.id,
                fromSectionId,
                toSectionId,
            });
        }

        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to move task" };
    }
}

export async function deleteSection(sectionId: string) {
    try {
        const session = await getSession();
        if (!session?.user) return { error: "Unauthorized" };

        if (session.user.role !== "ADMIN") {
            return { error: "Only admins can delete sections" };
        }
        await prisma.task.updateMany({
            where: { sectionId },
            data: { sectionId: null }
        });

        await prisma.section.delete({
            where: { id: sectionId }
        });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (e) {
        return { error: "Failed to delete" };
    }
}
