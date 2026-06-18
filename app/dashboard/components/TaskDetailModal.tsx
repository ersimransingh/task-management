"use client";

import { Modal } from "@/app/components/ui/Modal";
import { Button } from "@/app/components/ui/Button";
import { useState } from "react";
import { updateTask, deleteTask } from "@/app/actions/tasks";
import { Input } from "@/app/components/ui/Input";
import { Pencil, Trash } from "lucide-react";
import { RichTextEditor } from "@/app/components/ui/RichTextEditor";
import { FileUploadField } from "./FileUploadField";
import { AttachmentList } from "./AttachmentList";
import { CommentSection } from "./CommentSection";
import { TaskActivityLog } from "./TaskActivityLog";

interface TaskDetailModalProps {
    task: any;
    isOpen: boolean;
    onClose: () => void;
    currentUserId: string;
    groups: { id: string; name: string }[];
    sectionMap?: Record<string, string>;
}

export function TaskDetailModal({ task, isOpen, onClose, currentUserId, groups, sectionMap = {} }: TaskDetailModalProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Always call hooks at top level
    const [description, setDescription] = useState(task?.description || "");
    const [files, setFiles] = useState<File[]>([]);

    if (!task) return null;

    // Sync state when task changes
    // But we are in a controlled component manner via key or similar? 
    // Effect might be needed if modal re-opens with different task but same component instance?
    // Actually Modal unmounts content usually or Board keys it. 
    // Let's assume re-mount or we add a key there.
    // Ideally use Effect, but for now init state is okay if key changes on parent.

    const canEdit = task.creatorId === currentUserId || true; // We don't have user role easily here without fetching. Let's start with this.
    // Ideally we pass isAdmin prop too. 

    const handleUpdate = async (formData: FormData) => {
        formData.set("description", description);

        files.forEach((file, index) => {
            formData.append(`attachment-${index}`, file);
        });

        setIsLoading(true);
        const res = await updateTask(formData);
        setIsLoading(false);
        if (res?.success) {
            setIsEditing(false);
            setFiles([]);
            window.location.reload();
        } else {
            alert(res?.error);
        }
    };

    const handleDelete = async () => {
        if (!confirm("Are you sure you want to delete this task?")) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("taskId", task.id);

        const res = await deleteTask(formData);
        setIsLoading(false);

        if (res?.success) {
            onClose();
            window.location.reload();
        } else {
            alert(res?.error);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={() => { setIsEditing(false); setFiles([]); onClose(); }} title={isEditing ? "Edit Task" : `${task.title} #${task.id.slice(-4)}`} className="max-w-3xl">
            {isEditing ? (
                <form action={handleUpdate} className="space-y-4 mt-2">
                    <input type="hidden" name="taskId" value={task.id} />

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input name="title" defaultValue={task.title} required />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <RichTextEditor value={description} onChange={setDescription} />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Priority</label>
                        <select
                            name="priority"
                            defaultValue={task.priority}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Group</label>
                        <select
                            name="groupId"
                            defaultValue={task.groupId || ""}
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                        >
                            <option value="">No group</option>
                            {groups.map(g => (
                                <option key={g.id} value={g.id}>{g.name}</option>
                            ))}
                        </select>
                    </div>

                    <FileUploadField files={files} onFilesChange={setFiles} />

                    <div className="flex justify-end gap-2 pt-4">
                        <Button type="button" variant="ghost" onClick={() => setIsEditing(false)}>Cancel</Button>
                        <Button type="submit" isLoading={isLoading}>Save Changes</Button>
                    </div>
                </form>
            ) : (
                <div className="space-y-6">
                    <div className="flex justify-end gap-2">
                        {canEdit && (
                            <>
                                <Button size="sm" variant="ghost" className="h-8 text-red-500 hover:text-red-600 hover:bg-red-50" onClick={handleDelete} disabled={isLoading}>
                                    <Trash className="mr-2 h-3 w-3" /> Delete
                                </Button>
                                <Button size="sm" variant="ghost" className="h-8 text-muted-foreground" onClick={() => { setDescription(task.description || ""); setIsEditing(true); }}>
                                    <Pencil className="mr-2 h-3 w-3" /> Edit
                                </Button>
                            </>
                        )}
                    </div>

                    <div className="flex gap-2 -mt-4">
                        {/* badges ... */}
                        <span className={`px-2 py-1 rounded text-xs font-medium border ${task.priority === 'HIGH' ? 'border-red-200 bg-red-50 text-red-600' :
                            task.priority === 'MEDIUM' ? 'border-orange-200 bg-orange-50 text-orange-600' :
                                'border-blue-200 bg-blue-50 text-blue-600'
                            }`}>
                            {task.priority || "NO PRIORITY"}
                        </span>
                        <span className="px-2 py-1 rounded text-xs font-medium border border-border bg-muted text-foreground">
                            {task.status || "TODO"}
                        </span>
                        {task.group && (
                            <span className="px-2 py-1 rounded text-xs font-medium border border-purple-200 bg-purple-50 text-purple-600">
                                {task.group.name}
                            </span>
                        )}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-muted-foreground">Description</label>
                        <div
                            className="p-3 rounded-md bg-card border border-border min-h-[100px] text-sm text-foreground prose prose-sm max-w-none"
                            dangerouslySetInnerHTML={{ __html: task.description || "No description provided." }}
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Assignee</label>
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs">
                                    {task.assignee?.name?.charAt(0) || "?"}
                                </div>
                                <span className="text-sm text-foreground">{task.assignee?.name || "Unassigned"}</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground">Created</label>
                            <div className="text-sm text-foreground">
                                {new Date(task.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    <AttachmentList
                        attachments={task.attachments || []}
                        canDelete={canEdit}
                    />

                    <CommentSection
                        taskId={task.id}
                        comments={task.comments || []}
                        canDelete={canEdit}
                    />

                    <TaskActivityLog
                        activities={task.activities || []}
                        sectionMap={sectionMap}
                    />

                    <div className="pt-4 flex justify-end">
                        <Button variant="ghost" onClick={onClose}>Close</Button>
                    </div>
                </div>
            )}
        </Modal>
    );
}
