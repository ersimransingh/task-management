import { getSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { Button } from "@/app/components/ui/Button"; // If we want to add edit later
import { User, Building2, Shield, Mail } from "lucide-react";

export default async function SettingsPage() {
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

    const user = await prisma.user.findUnique({
        where: { id: session.user.id },
        include: { company: true }
    });

    if (!user) return <div>User not found</div>;

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
                <p className="text-muted-foreground">Manage your account and workspace preferences.</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                {/* User Profile Card */}
                <Card className="glass border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5 text-primary" />
                            Profile
                        </CardTitle>
                        <CardDescription>Your personal information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center space-x-4 p-3 rounded-lg bg-secondary">
                            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-lg font-bold text-primary-foreground">
                                {user.name.charAt(0)}
                            </div>
                            <div>
                                <p className="font-medium text-foreground">{user.name}</p>
                                <p className="text-sm text-muted-foreground">User ID: {user.id.slice(0, 8)}...</p>
                            </div>
                        </div>

                        <div className="space-y-3 pt-2">
                            <div className="flex items-center text-sm text-foreground/80">
                                <Mail className="h-4 w-4 mr-3 text-muted-foreground" />
                                {user.email}
                            </div>
                            <div className="flex items-center text-sm text-foreground/80">
                                <Shield className="h-4 w-4 mr-3 text-muted-foreground" />
                                Role: <span className="ml-1 px-2 py-0.5 rounded-full bg-secondary text-xs text-muted-foreground border border-border">{user.role}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Workspace Card */}
                <Card className="glass border-gray-200">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-emerald-600" />
                            Workspace
                        </CardTitle>
                        <CardDescription>Company information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg border border-border bg-secondary/50">
                            <p className="text-sm text-muted-foreground uppercase tracking-wider font-semibold mb-1">Company Name</p>
                            <p className="text-xl font-bold text-foreground">{user.company.name}</p>
                        </div>

                        <div className="space-y-2">
                            <p className="text-sm text-muted-foreground">
                                Workspace ID: <span className="font-mono text-foreground">{user.companyId}</span>
                            </p>
                            <p className="text-sm text-muted-foreground">
                                Created: <span className="text-foreground">{user.company.createdAt.toLocaleDateString()}</span>
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
