"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";
import { Input } from "@/app/components/ui/Input";
import { createTask } from "@/app/actions/tasks";

// Update props to accept users
interface CreateTaskButtonProps {
    users: { id: string; name: string }[];
}

export function CreateTaskButton({ users }: CreateTaskButtonProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [description, setDescription] = useState("");

    async function handleSubmit(formData: FormData) {
        formData.set("description", description); // Manually set rich text content
        setIsLoading(true);
        const res = await createTask(formData);
        setIsLoading(false);
        if (res?.success) {
            setIsOpen(false);
            setDescription(""); // Reset
            window.location.reload(); // Force refresh to show new task immediately
        } else if (res?.error) {
            alert(res.error);
        }
    }

    return (
        <>
            <Button onClick={() => setIsOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                New Task
            </Button>

            <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Create New Task" className="max-w-2xl">
                <form action={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" placeholder="Task title" required autoFocus />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor
                            value={description}
                            onChange={setDescription}
                            placeholder="Add details..."
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select
                            name="priority"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="LOW" className="bg-card">Low</option>
                            <option value="MEDIUM" className="bg-card" defaultChecked>Medium</option>
                            <option value="HIGH" className="bg-card">High</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Assign To</label>
                        <select
                            name="assigneeId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                            <option value="" className="bg-card">Unassigned</option>
                            {users.map(u => (
                                <option key={u.id} value={u.id} className="bg-card">{u.name}</option>
                            ))}
                        </select>
                    </div>

                    <div className="flex justify-end pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsOpen(false)} className="mr-2">
                            Cancel
                        </Button>
                        <Button type="submit" isLoading={isLoading}>
                            Create Task
                        </Button>
                    </div>
                </form>
            </Modal>
        </>
    );
}
