"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";

export async function createUser(formData: FormData) {
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    const role = formData.get("role") as string;

    if (!name || !email || !password) return { error: "Missing fields" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    if (session.user.role !== "ADMIN") return { error: "Only admins can create users" };

    const admin = session.user;

    try {
        const hashedPassword = await hash(password, 12);
        await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role || "USER",
                companyId: admin.companyId,
            },
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to create user" };
    }
}

export async function updateUserPassword(formData: FormData) {
    const userId = formData.get("userId") as string;
    const newPassword = formData.get("newPassword") as string;

    if (!userId || !newPassword) return { error: "Missing fields" };

    const session = await getSession();
    if (!session?.user) return { error: "Unauthorized" };

    if (session.user.role !== "ADMIN") {
        return { error: "Only admins can change passwords" };
    }

    try {
        const hashedPassword = await hash(newPassword, 12);
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }
        });
        revalidatePath("/dashboard/users");
        return { success: true };
    } catch (e) {
        console.error(e);
        return { error: "Failed to update password" };
    }
}
