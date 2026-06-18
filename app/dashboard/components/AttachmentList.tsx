"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { deleteAttachment } from "@/app/actions/attachments";
import { FileText, Trash2, Download } from "lucide-react";

interface Attachment {
    id: string;
    fileName: string;
    filePath: string;
    fileSize: number;
    mimeType: string;
    uploadedBy?: { name: string };
    createdAt: string;
}

interface AttachmentListProps {
    attachments: Attachment[];
    canDelete?: boolean;
}

export function AttachmentList({ attachments, canDelete = true }: AttachmentListProps) {
    const router = useRouter();
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleDelete = async (attachmentId: string) => {
        if (!confirm("Are you sure you want to delete this attachment?")) return;
        setDeletingId(attachmentId);
        const formData = new FormData();
        formData.append("attachmentId", attachmentId);
        const res = await deleteAttachment(formData);
        setDeletingId(null);
        if (res?.error) {
            alert(res.error);
        } else {
            router.refresh();
        }
    };

    if (attachments.length === 0) return null;

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Attachments</label>
            <div className="space-y-2">
                {attachments.map((attachment) => (
                    <div
                        key={attachment.id}
                        className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                    >
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                            <div className="flex flex-col overflow-hidden">
                                <a
                                    href={attachment.filePath}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="truncate font-medium text-foreground hover:text-primary hover:underline"
                                >
                                    {attachment.fileName}
                                </a>
                                <span className="text-xs text-muted-foreground">
                                    {(attachment.fileSize / 1024).toFixed(1)} KB
                                    {attachment.uploadedBy && ` • ${attachment.uploadedBy.name}`}
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1 shrink-0">
                            <a
                                href={attachment.filePath}
                                download={attachment.fileName}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-md text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                            >
                                <Download className="h-4 w-4" />
                            </a>
                            {canDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(attachment.id)}
                                    isLoading={deletingId === attachment.id}
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
