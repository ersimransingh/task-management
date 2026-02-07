"use client";

import { useState } from "react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { updateUserPassword } from "@/app/actions/users";
import { Lock } from "lucide-react";

interface ChangePasswordProps {
    userId: string;
    userName: string;
}

export function ChangePasswordButton({ userId, userName }: ChangePasswordProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        formData.append("userId", userId);
        const res = await updateUserPassword(formData);
        setIsLoading(false);
        if (res?.success) {
            setIsOpen(false);
            alert("Password updated successfully");
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <Button variant="ghost" size="sm" onClick={() => setIsOpen(true)} title="Change Password">
                <Lock className="h-4 w-4" />
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title={`Change Password for ${userName}`}>
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">New Password</label>
                        <Input name="newPassword" type="password" placeholder="New password" required />
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Update Password
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
