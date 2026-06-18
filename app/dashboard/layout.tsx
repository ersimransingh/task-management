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

    const users = session?.user?.companyId
        ? await prisma.user.findMany({
            where: { companyId: session.user.companyId },
            select: { id: true, name: true }
        })
        : [];

    const groups = session?.user?.companyId
        ? await prisma.group.findMany({
            where: { companyId: session.user.companyId },
            orderBy: { name: 'asc' },
            select: { id: true, name: true }
        })
        : [];

    return (
        <div className="flex h-screen overflow-hidden bg-background text-foreground">
            <Sidebar companyName={companyName} role={session?.user?.role} />
            <div className="flex-1 flex flex-col min-w-0">
                <Header
                    user={{ name: session?.user?.name || "", role: session?.user?.role || "" }}
                    companyName={companyName}
                    users={users}
                    groups={groups}
                />
                <main className="flex-1 overflow-y-auto p-8">
                    {children}
                </main>
            </div>
        </div>
    );
}
