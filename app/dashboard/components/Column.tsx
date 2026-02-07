"use client";

import { useSortable, SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { TaskCard } from "./TaskCard";
import { MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/app/components/ui/Button";

interface ColumnProps {
    id: string;
    title: string;
    tasks: any[];
    onDelete?: () => void;
    onTaskClick?: (task: any) => void;
}

// Remove duplicate imports if any remain below
// ...

// ...

export function Column({ id, title, tasks, onDelete, onTaskClick }: ColumnProps) {
    const {
        setNodeRef,
        attributes,
        listeners,
        transform,
        transition,
        isDragging
    } = useSortable({
        id: id,
        data: {
            type: "Column",
            column: { id, title }
        },
        disabled: false // Can check role here if we pass it, but better to control enable/disable from parent or just let dragging happen but reject on backend if needed. Parent logic is better.
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };

    if (isDragging) {
        return (
            <div
                ref={setNodeRef}
                style={style}
                className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-gray-50/50 border-2 border-dashed border-indigo-500/50 opacity-50"
            />
        );
    }

    return (
        <div
            ref={setNodeRef}
            style={style}
            className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-gray-50 border border-gray-200"
        >
            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <div
                    className="flex items-center space-x-2 cursor-grab active:cursor-grabbing hover:bg-gray-100/50 p-1 rounded -ml-1"
                    {...attributes}
                    {...listeners}
                >
                    <h3 className="font-semibold text-gray-900 select-none">{title}</h3>
                    <span className="rounded-full bg-gray-200 px-2 py-0.5 text-xs text-gray-600 select-none">
                        {tasks.length}
                    </span>
                </div>
                {onDelete && (
                    <Button variant="ghost" size="sm" onClick={onDelete} className="h-8 w-8 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50">
                        <Trash className="h-4 w-4" />
                    </Button>
                )}
            </div>

            <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto">
                <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
                    {tasks.map((task) => (
                        <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task)} />
                    ))}
                </SortableContext>
                {tasks.length === 0 && (
                    <div className="h-32 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                        Drop items here
                    </div>
                )}
            </div>
        </div>
    );
}
