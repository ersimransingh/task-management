import { prisma } from "@/lib/prisma";
import { CreateUserButton } from "./CreateUserButton";
import { ChangePasswordButton } from "./ChangePasswordButton";
import { Card, CardHeader, CardTitle, CardContent } from "@/app/components/ui/Card";
import { User as UserIcon } from "lucide-react";
import { getSession } from "@/lib/auth";

export default async function UsersPage() {
    const session = await getSession();
    if (!session?.user) return <div>Unauthorized</div>;

    if (session.user.role !== "ADMIN") {
        return (
            <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <h1 className="text-2xl font-bold">Access Restricted</h1>
                <p className="text-muted-foreground">You do not have permission to view this page.</p>
            </div>
        );
    }

    const users = await prisma.user.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { createdAt: "desc" },
    });

    return (
        <div className="flex flex-col space-y-8">
            <div className="flex justify-end">
                <CreateUserButton />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {users.map((user: any) => (
                    <Card key={user.id} className="glass border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <UserIcon className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">{user.name}</CardTitle>
                                    <div className="text-sm text-muted-foreground">{user.email}</div>
                                </div>
                            </div>
                            <ChangePasswordButton userId={user.id} userName={user.name} />
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground border border-border">
                                    {user.role}
                                </span>
                                <span className="px-2 py-1 bg-secondary rounded text-xs text-muted-foreground border border-border">
                                    Joined {new Date(user.createdAt).toLocaleDateString()}
                                </span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}
