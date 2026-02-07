import { Sidebar } from "@/app/components/layout/Sidebar";
import { Header } from "@/app/components/layout/Header";

import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await getSession();
    let companyName = "TaskMaster";

    if (session?.user?.companyId) {
        const company = await prisma.company.findUnique({
            where: { id: session.user.companyId },
            select: { name: true }
        });
        if (company) companyName = company.name;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar companyName={companyName} role={session?.user?.role} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
