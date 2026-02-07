"use client";

import { useActionState } from "react";
import { initialSetup } from "@/app/actions/setup";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/app/components/ui/Card";
import { motion } from "framer-motion";

export default function SetupPage() {
    const [state, formAction, isPending] = useActionState(async (prev: any, formData: FormData) => {
        return initialSetup(formData);
    }, null);

    return (
        <div className="min-h-screen grid items-center justify-center p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900/40 via-background to-background">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-lg"
            >
                <Card className="glass border-indigo-500/20 shadow-2xl shadow-indigo-500/10">
                    <CardHeader className="text-center">
                        <CardTitle className="text-3xl font-bold bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                            Welcome
                        </CardTitle>
                        <CardDescription className="text-lg mt-2">
                            Let's set up your workspace
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form action={formAction} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Company Name</label>
                                <Input name="companyName" placeholder="Acme Inc." required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Admin Name</label>
                                <Input name="adminName" placeholder="John Doe" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Admin Email</label>
                                <Input name="adminEmail" type="email" placeholder="john@example.com" required />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Password</label>
                                <Input name="password" type="password" placeholder="••••••••" required />
                            </div>

                            {state?.error && (
                                <p className="text-red-400 text-sm text-center">{state.error}</p>
                            )}

                            <Button type="submit" className="w-full h-12 text-lg" isLoading={isPending}>
                                Create Workspace
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </motion.div>
        </div>
    );
}
