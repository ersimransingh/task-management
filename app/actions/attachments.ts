"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir, unlink } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { logActivity } from "./activity";

const UPLOAD_BASE_DIR = path.join(process.cwd(), "public", "uploads", "tasks");

function sanitizeFileName(name: string) {
    return name.replace(/[^a-zA-Z0-9.\-_]/g, "_");
}

export async function saveAttachmentsForTask(taskId: string, files: File[], uploaderId: string) {
    const attachments = [];

    const taskDir = path.join(UPLOAD_BASE_DIR, taskId);
    if (!existsSync(taskDir)) {
        await mkdir(taskDir, { recursive: true });
    }

    for (const file of files) {
        const bytes = await file.arrayBuffer();
        const sanitizedName = sanitizeFileName(file.name);
        const uniqueName = `${Date.now()}_${sanitizedName}`;
        const filePath = path.join(taskDir, uniqueName);
        const relativePath = `/uploads/tasks/${taskId}/${uniqueName}`;

        await writeFile(filePath, Buffer.from(bytes));

        const attachment = await prisma.attachment.create({
            data: {
                fileName: file.name,
                filePath: relativePath,
                fileSize: file.size,
                mimeType: file.type || "application/octet-stream",
                taskId,
                uploadedById: uploaderId,
            },
        });

        await logActivity({
            action: "ATTACHMENT_ADD",
            taskId,
            userId: uploaderId,
            metadata: JSON.stringify({ attachmentId: attachment.id, fileName: file.name, fileSize: file.size }),
        });

        attachments.push(attachment);
    }

    return attachments;
}

export async function deleteAttachment(formData: FormData) {
    const attachmentId = formData.get("attachmentId") as string;

    if (!attachmentId) return { error: "Attachment ID is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    try {
        const attachment = await prisma.attachment.findUnique({
            where: { id: attachmentId },
            include: { task: { select: { companyId: true } }, uploadedBy: { select: { id: true, role: true } } }
        });

        if (!attachment) return { error: "Attachment not found" };
        if (attachment.task.companyId !== user.companyId) return { error: "Unauthorized" };

        const isUploader = attachment.uploadedById === user.id;
        const dbUser = await prisma.user.findUnique({ where: { id: user.id } });
        if (!isUploader && dbUser?.role !== "ADMIN") {
            return { error: "You do not have permission to delete this attachment." };
        }

        const fullPath = path.join(process.cwd(), "public", attachment.filePath);
        if (existsSync(fullPath)) {
            await unlink(fullPath);
        }

        await logActivity({
            action: "ATTACHMENT_DELETE",
            taskId: attachment.taskId,
            userId: user.id,
            metadata: JSON.stringify({ attachmentId, fileName: attachment.fileName }),
        });

        await prisma.attachment.delete({ where: { id: attachmentId } });
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete attachment" };
    }
}
