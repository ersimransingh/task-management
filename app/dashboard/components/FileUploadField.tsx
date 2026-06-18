"use client";

import { useRef } from "react";
import { Button } from "@/app/components/ui/Button";
import { Paperclip, X, File } from "lucide-react";

interface FileUploadFieldProps {
    files: File[];
    onFilesChange: (files: File[]) => void;
}

export function FileUploadField({ files, onFilesChange }: FileUploadFieldProps) {
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;
        const selected = Array.from(e.target.files);
        onFilesChange([...files, ...selected]);
        e.target.value = "";
    };

    const removeFile = (index: number) => {
        onFilesChange(files.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2">
            <label className="text-sm font-medium">Attachments</label>

            <input
                ref={inputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileChange}
            />

            <Button
                type="button"
                variant="outline"
                onClick={() => inputRef.current?.click()}
                className="gap-2"
            >
                <Paperclip className="h-4 w-4" />
                Add Files
            </Button>

            {files.length > 0 && (
                <div className="space-y-2">
                    {files.map((file, index) => (
                        <div
                            key={`${file.name}-${index}`}
                            className="flex items-center justify-between rounded-md border border-border bg-background px-3 py-2 text-sm"
                        >
                            <div className="flex items-center gap-2 overflow-hidden">
                                <File className="h-4 w-4 shrink-0 text-muted-foreground" />
                                <span className="truncate">{file.name}</span>
                                <span className="text-xs text-muted-foreground shrink-0">
                                    ({(file.size / 1024).toFixed(1)} KB)
                                </span>
                            </div>
                            <Button
                                type="button"
                                variant="ghost"
                                size="sm"
                                className="h-7 w-7 p-0 shrink-0"
                                onClick={() => removeFile(index)}
                            >
                                <X className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
