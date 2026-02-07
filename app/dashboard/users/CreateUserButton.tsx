"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { createUser } from "@/app/actions/users";

export function CreateUserButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await createUser(formData);
        setIsLoading(false);
        if (res?.success) {
            setIsOpen(false);
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add User
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Add Team Member">
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Name</label>
                        <Input name="name" placeholder="Jane Doe" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Email</label>
                        <Input name="email" type="email" placeholder="jane@example.com" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Password</label>
                        <Input name="password" type="password" placeholder="Temporary password" required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Role</label>
                        <select
                            name="role"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="USER" className="bg-card">User</option>
                            <option value="ADMIN" className="bg-card">Admin</option>
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create User
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
