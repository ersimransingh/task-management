"use client";

import { useActionState } from "react";
import { registerAction } from "@/app/actions/auth";
import { Button } from "@/app/components/ui/Button";
import { Input } from "@/app/components/ui/Input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from "@/app/components/ui/Card";
import Link from "next/link";

export default function RegisterPage() {
    const [state, action, isPending] = useActionState(registerAction, undefined);

    return (
        <div className="flex min-h-screen items-center justify-center bg-black p-4">
            <Card className="w-full max-w-md glass border-zinc-800">
                <CardHeader className="space-y-1">
                    <CardTitle className="text-2xl font-bold bg-gradient-to-r from-white to-zinc-500 bg-clip-text text-transparent">
                        Create Workspace
                    </CardTitle>
                    <CardDescription>
                        Get started with your new team workspace
                    </CardDescription>
                </CardHeader>
                <form action={action}>
                    <CardContent className="space-y-4">
                        {state?.error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-md text-sm">
                                {state.error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <label htmlFor="companyName" className="text-sm font-medium text-zinc-300">Company Name</label>
                            <Input id="companyName" name="companyName" placeholder="Acme Inc." required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-zinc-300">Admin Name</label>
                            <Input id="name" name="name" placeholder="John Doe" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="email" className="text-sm font-medium text-zinc-300">Email</label>
                            <Input id="email" name="email" type="email" placeholder="m@example.com" required />
                        </div>
                        <div className="space-y-2">
                            <label htmlFor="password" className="text-sm font-medium text-zinc-300">Password</label>
                            <Input id="password" name="password" type="password" required />
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4">
                        <Button className="w-full bg-white text-black hover:bg-zinc-200" disabled={isPending}>
                            {isPending ? "Creating..." : "Create Workspace"}
                        </Button>
                        <div className="text-center text-sm text-zinc-500">
                            Already have an account? <Link href="/login" className="text-white hover:underline">Sign In</Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>

            {/* Background decoration */}
            <div className="absolute top-0 right-0 w-full h-1/2 bg-gradient-to-b from-indigo-500/10 to-transparent -z-10" />
        </div>
    );
}
