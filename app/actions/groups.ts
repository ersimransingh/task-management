"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { getSession } from "@/lib/auth";

export async function createGroup(formData: FormData) {
    const name = formData.get("name") as string;

    if (!name) return { error: "Group name is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    if (user.role !== "ADMIN") return { error: "Only admins can create groups" };

    try {
        await prisma.group.create({
            data: {
                name,
                companyId: user.companyId,
            },
        });
        revalidatePath("/dashboard/groups");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create group" };
    }
}

export async function deleteGroup(formData: FormData) {
    const groupId = formData.get("groupId") as string;

    if (!groupId) return { error: "Group ID is required" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };
    const user = session.user;

    if (user.role !== "ADMIN") return { error: "Only admins can delete groups" };

    try {
        const group = await prisma.group.findUnique({
            where: { id: groupId },
            select: { companyId: true },
        });

        if (!group) return { error: "Group not found" };
        if (group.companyId !== user.companyId) return { error: "Unauthorized" };

        await prisma.$transaction([
            prisma.task.updateMany({
                where: { groupId },
                data: { groupId: null },
            }),
            prisma.group.delete({
                where: { id: groupId },
            }),
        ]);

        revalidatePath("/dashboard/groups");
        revalidatePath("/dashboard");
        return { success: true };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete group" };
    }
}

export async function getGroups() {
    const session = await getSession();
    if (!session?.user) return [];

    return prisma.group.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { name: "asc" },
        select: { id: true, name: true },
    });
}
