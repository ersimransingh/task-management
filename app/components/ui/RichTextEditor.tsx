"use client";

import { useEffect, useRef, useState } from "react";
import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    readOnly?: boolean;
}

export function RichTextEditor({ value, onChange, placeholder, readOnly }: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    // Sync initial value or external updates (careful not to reset cursor if user is typing)
    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            // Only update if the content is truly different to avoid cursor jumps
            // Use a simple check: if the editor is focused, we might want to avoid updating unless strictly needed
            // But for this simple version, let's just update if empty or substantially different.
            // Actually, for a controlled component feeling, we usually only set innerHTML if 
            // the new value is different AND the editor isn't the one that just triggered the change. 
            // But since onChange updates parent state -> parent passes back value -> we might re-render.

            // A common workaround is to compare strip tags or just length, or only update on blur/focus?
            // Let's try: only set if editor is empty (initial load) or separate tracking.

            // Allow update if value is empty (reset)
            if (value === "" && editorRef.current.innerHTML !== "") {
                editorRef.current.innerHTML = "";
            } else if (value && editorRef.current.innerHTML === "") {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html === "<br>" ? "" : html);
        }
    };

    const execCommand = (command: string, value?: string) => {
        document.execCommand(command, false, value);
        handleInput(); // Trigger update after command
        editorRef.current?.focus();
    };

    if (!isMounted) return null; // Avoid hydration mismatch

    if (readOnly) {
        return (
            <div
                className="p-3 rounded-md bg-card border border-border min-h-[100px] text-sm text-foreground prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: value || "No description provided." }}
            />
        );
    }

    return (
        <div className="flex flex-col border border-border rounded-md overflow-hidden bg-card focus-within:ring-2 focus-within:ring-indigo-500/50 transition-all">
            {/* Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-gray-50/50">
                <ToolbarButton
                    icon={<Bold className="w-4 h-4" />}
                    onClick={() => execCommand('bold')}
                    label="Bold"
                />
                <ToolbarButton
                    icon={<Italic className="w-4 h-4" />}
                    onClick={() => execCommand('italic')}
                    label="Italic"
                />
                <ToolbarButton
                    icon={<Underline className="w-4 h-4" />}
                    onClick={() => execCommand('underline')}
                    label="Underline"
                />
                <div className="w-px h-4 bg-border mx-1" />
                <ToolbarButton
                    icon={<List className="w-4 h-4" />}
                    onClick={() => execCommand('insertUnorderedList')}
                    label="Bullet List"
                />
                <ToolbarButton
                    icon={<ListOrdered className="w-4 h-4" />}
                    onClick={() => execCommand('insertOrderedList')}
                    label="Ordered List"
                />
            </div>

            {/* Editor Area */}
            <div
                ref={editorRef}
                className="flex-1 p-3 min-h-[150px] outline-none text-sm text-foreground prose prose-sm max-w-none"
                contentEditable={!readOnly}
                onInput={handleInput}
                suppressContentEditableWarning
                data-placeholder={placeholder}
                style={{ whiteSpace: "pre-wrap" }} // Preserve spacing
            />
        </div>
    );
}

function ToolbarButton({ icon, onClick, label }: { icon: React.ReactNode, onClick: (e: React.MouseEvent) => void, label: string }) {
    return (
        <button
            type="button"
            onClick={(e) => {
                e.preventDefault(); // Prevent form submission if inside form
                onClick(e);
            }}
            title={label}
            className="p-1.5 rounded hover:bg-gray-100 text-gray-500 hover:text-foreground transition-colors"
        >
            {icon}
        </button>
    );
}
