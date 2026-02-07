import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Building2 } from "lucide-react";

export async function Header() {
    const session = await getSession();
    if (!session?.user) return null;

    // Fetch fresher data if needed, or trust session
    // Session has name and companyId. Let's fetch company name.
    const company = await prisma.company.findUnique({
        where: { id: session.user.companyId },
        select: { name: true }
    });

    return (
        <div className="flex items-center justify-end px-8 py-4 border-b border-border bg-card/50">
            <div className="flex items-center gap-4">
                <div className="text-right">
                    <p className="text-sm font-medium leading-none text-foreground">{session.user.name}</p>
                    <p className="text-xs text-muted-foreground flex items-center justify-end gap-1 mt-1">
                        <Building2 className="h-3 w-3" />
                        {company?.name || "Company"}
                    </p>
                </div>
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold text-white">
                    {session.user.name.charAt(0)}
                </div>
            </div>
        </div>
    );
}
