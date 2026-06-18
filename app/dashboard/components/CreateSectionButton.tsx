"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { Input } from "@/app/components/ui/Input";
import { createSection } from "@/app/actions/board";
import { useRouter } from "next/navigation";

export function CreateSectionButton() {
    const router = useRouter();
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    async function handleSubmit(formData: FormData) {
        setIsLoading(true);
        const res = await createSection(formData);
        setIsLoading(false);
        if (res?.success) {
            setIsOpen(false);
            router.refresh();
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)} variant="outline" className="gap-2">
                <Plus className="h-4 w-4" />
                Create Section
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create Section">
                <form action={handleSubmit} className="space-y-4">
                    <Input name="title" placeholder="Section Name (e.g. Design)" required autoFocus />
                    <div className="flex justify-end">
                        <Button type="submit" isLoading={isLoading}>Create</Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
