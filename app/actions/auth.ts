"use server";

import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { compare, hash } from "bcryptjs";
import { login, logout } from "@/lib/auth";

export async function loginAction(prevState: any, formData: FormData) {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!email || !password) return { error: "Missing fields" };

    try {
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) return { error: "Invalid credentials" };

        const passwordsMatch = await compare(password, user.password);
        if (!passwordsMatch) return { error: "Invalid credentials" };

        await login({
            id: user.id,
            email: user.email,
            name: user.name,
            companyId: user.companyId,
            role: user.role
        });

    } catch (error) {
        return { error: "Something went wrong" };
    }

    redirect("/dashboard");
}

export async function registerAction(formData: FormData) {
    const companyName = formData.get("companyName") as string;
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (!companyName || !name || !email || !password) {
        return { error: "All fields are required" };
    }

    // Limit to 1 workplace
    const companyCount = await prisma.company.count();
    if (companyCount > 0) {
        return { error: "Only one workspace is allowed. Please sign in." };
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) return { error: "User already exists" };

    const hashedPassword = await hash(password, 10);

    try {
        const company = await prisma.company.create({
            data: {
                name: companyName,
                users: {
                    create: {
                        name,
                        email,
                        password: hashedPassword,
                        role: "ADMIN"
                    }
                },
                // Create default sections
                sections: {
                    create: [
                        { title: "To Do", order: 0 },
                        { title: "In Progress", order: 1 },
                        { title: "Review", order: 2 },
                        { title: "Done", order: 3 },
                    ]
                }
            },
            include: { users: true }
        });

        const user = company.users[0];

        await login({
            id: user.id,
            email: user.email,
            name: user.name,
            companyId: user.companyId,
            role: user.role
        });

    } catch (e) {
        console.error(e);
        return { error: "Registration failed" };
    }

    redirect("/dashboard");
}

export async function logoutAction() {
    await logout();
    redirect("/login");
}
