import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { CreateGroupForm, DeleteGroupButton } from "./GroupForms";
import { Card, CardContent, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Folder, Users } from "lucide-react";

export default async function GroupsPage() {
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

    const groups = await prisma.group.findMany({
        where: { companyId: session.user.companyId },
        orderBy: { name: "asc" },
        include: {
            _count: {
                select: { tasks: true },
            },
        },
    });

    return (
        <div className="flex flex-col space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg">Create Group</CardTitle>
                </CardHeader>
                <CardContent>
                    <CreateGroupForm />
                </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {groups.map((group) => (
                    <Card key={group.id} className="border-gray-200">
                        <CardHeader className="flex flex-row items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                    <Folder className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="text-lg text-gray-900">{group.name}</CardTitle>
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Users className="h-3 w-3" />
                                        {group._count.tasks} task{group._count.tasks === 1 ? "" : "s"}
                                    </div>
                                </div>
                            </div>
                            <DeleteGroupButton groupId={group.id} />
                        </CardHeader>
                    </Card>
                ))}

                {groups.length === 0 && (
                    <div className="col-span-full text-center py-12 text-muted-foreground">
                        No groups yet. Create one above to start organizing tasks.
                    </div>
                )}
            </div>
        </div>
    );
}
