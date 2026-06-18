"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/app/components/ui/Button";
import { Textarea } from "@/app/components/ui/Textarea";
import { createComment, deleteComment } from "@/app/actions/comments";
import { Trash2, Send } from "lucide-react";

interface Comment {
    id: string;
    content: string;
    createdAt: string;
    user: { id: string; name: string };
}

interface CommentSectionProps {
    taskId: string;
    comments: Comment[];
    canDelete?: boolean;
}

export function CommentSection({ taskId, comments, canDelete = true }: CommentSectionProps) {
    const router = useRouter();
    const [content, setContent] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!content.trim()) return;

        setIsLoading(true);
        const formData = new FormData();
        formData.append("taskId", taskId);
        formData.append("content", content);
        const res = await createComment(formData);
        setIsLoading(false);

        if (res?.success) {
            setContent("");
            router.refresh();
        } else if (res?.error) {
            alert(res.error);
        }
    };

    const handleDelete = async (commentId: string) => {
        if (!confirm("Delete this comment?")) return;
        setDeletingId(commentId);
        const formData = new FormData();
        formData.append("commentId", commentId);
        const res = await deleteComment(formData);
        setDeletingId(null);
        if (res?.error) {
            alert(res.error);
        } else {
            router.refresh();
        }
    };

    return (
        <div className="space-y-4">
            <label className="text-sm font-medium text-muted-foreground">Comments</label>

            <form onSubmit={handleSubmit} className="space-y-2">
                <Textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Add a comment..."
                    rows={3}
                />
                <div className="flex justify-end">
                    <Button type="submit" isLoading={isLoading} className="gap-2">
                        <Send className="h-4 w-4" /> Post
                    </Button>
                </div>
            </form>

            <div className="space-y-3 pr-1">
                {comments.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">No comments yet.</p>
                )}
                {comments.map((comment) => (
                    <div key={comment.id} className="rounded-lg border border-border bg-card p-3">
                        <div className="flex items-start justify-between gap-2">
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-medium">
                                    {comment.user.name.charAt(0)}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-sm font-medium">{comment.user.name}</span>
                                    <span className="text-xs text-muted-foreground">
                                        {new Date(comment.createdAt).toLocaleString()}
                                    </span>
                                </div>
                            </div>
                            {canDelete && (
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-7 w-7 p-0 text-red-500 hover:text-red-600 hover:bg-red-50"
                                    onClick={() => handleDelete(comment.id)}
                                    isLoading={deletingId === comment.id}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </Button>
                            )}
                        </div>
                        <p className="mt-2 text-sm text-foreground whitespace-pre-wrap">{comment.content}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
