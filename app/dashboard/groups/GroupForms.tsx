"use client";

import { useState } from "react";
import { createGroup, deleteGroup } from "@/app/actions/groups";
import { Input } from "@/app/components/ui/Input";
import { Button } from "@/app/components/ui/Button";
import { Trash2 } from "lucide-react";

export function CreateGroupForm() {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await createGroup(formData);
        setIsLoading(false);
        if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <form action={handleSubmit} className="flex gap-3">
            <Input name="name" placeholder="Group name (e.g. Engineering)" required className="max-w-md" />
            <Button type="submit" isLoading={isLoading}>Create</Button>
        </form>
    );
}

export function DeleteGroupButton({ groupId }: { groupId: string }) {
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        if (!confirm("Are you sure you want to delete this group? Tasks in this group will be ungrouped.")) return;
        setIsLoading(true);
        const res = await deleteGroup(formData);
        setIsLoading(false);
        if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <form action={handleSubmit}>
            <input type="hidden" name="groupId" value={groupId} />
            <Button
                type="submit"
                size="sm"
                variant="ghost"
                className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                isLoading={isLoading}
            >
                <Trash2 className="h-4 w-4" />
            </Button>
        </form>
    );
}
