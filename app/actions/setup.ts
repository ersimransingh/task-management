"use server";

import { prisma } from "@/lib/prisma";
import { hash } from "bcryptjs";
import { redirect } from "next/navigation";

export async function initialSetup(formData: FormData) {
    const companyName = formData.get("companyName") as string;
    const adminName = formData.get("adminName") as string;
    const adminEmail = formData.get("adminEmail") as string;
    const password = formData.get("password") as string;

    if (!companyName || !adminName || !adminEmail || !password) {
        return { error: "All fields are required" };
    }

    // Check if setup already exists (double check)
    const existingCompany = await prisma.company.findFirst();
    if (existingCompany) {
        return { error: "Setup already completed" };
    }

    const hashedPassword = await hash(password, 12);

    try {
        const company = await prisma.company.create({
            data: {
                name: companyName,
                users: {
                    create: {
                        name: adminName,
                        email: adminEmail,
                        password: hashedPassword,
                        role: "ADMIN",
                    },
                },
            },
        });
    } catch (e) {
        console.error(e);
        return { error: "Failed to create setup" };
    }

    redirect("/dashboard");
}
