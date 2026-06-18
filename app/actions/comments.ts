"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { logActivity } from "./activity";

export async function createComment(formData: FormData) {
    const taskId = formData.get("taskId") as string;
    const content = formData.get("content") as string;

    if (!taskId || !content?.trim()) return { error: "Comment content is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            select: { companyId: true }
        });

        if (!task) return { error: "Task not found" };
        if (task.companyId !== user.companyId) return { error: "Unauthorized" };

        const comment = await prisma.comment.create({
            data: {
                content: content.trim(),
                taskId,
                userId: user.id,
            },
        });

        await logActivity({
            action: "COMMENT",
            taskId,
            userId: user.id,
            metadata: JSON.stringify({ commentId: comment.id, content: content.trim().slice(0, 200) }),
        });

        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to add comment" };
    }
}

export async function deleteComment(formData: FormData) {
    const commentId = formData.get("commentId") as string;

    if (!commentId) return { error: "Comment ID is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    try {
        const comment = await prisma.comment.findUnique({
            where: { id: commentId },
            include: { task: { select: { companyId: true } }, user: { select: { id: true, role: true } } }
        });

        if (!comment) return { error: "Comment not found" };
        if (comment.task.companyId !== user.companyId) return { error: "Unauthorized" };

        const isAuthor = comment.userId === user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!isAuthor && dbUser?.role !== "ADMIN") {
            return { error: "You do not have permission to delete this comment." };
        }

        await logActivity({
            action: "COMMENT_DELETE",
            taskId: comment.taskId,
            userId: user.id,
            metadata: JSON.stringify({ commentId, content: comment.content.slice(0, 200) }),
        });

        await prisma.comment.delete({ where: { id: commentId } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete comment" };
    }
}
