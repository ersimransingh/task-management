"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/app/components/ui/Card";
import { GripVertical } from "lucide-react";

interface TaskCardProps {
    task: any;
    isOverlay?: boolean;
    onClick?: () => void;
}

export function TaskCard({ task, isOverlay, onClick }: TaskCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: task.id,
        data: {
            type: "Task",
            task,
        }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    if (isOverlay) {
        return (
            <Card className="cursor-grabbing shadow-2xl rotate-2 bg-card border-indigo-500/50 w-[330px]">
                <CardHeader className="p-4 pb-2 space-y-0">
                    <div className="flex justify-between items-start">
                        <CardTitle className="text-sm font-medium leading-none">{task.title}</CardTitle>
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                    </div>
                </CardHeader>
                <CardContent className="p-4 pt-2">
                    <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            onClick={onClick}
            className="cursor-grab active:cursor-grabbing hover:border-indigo-300 transition-colors bg-card group border-transparent hover:shadow-sm"
        >
            <CardHeader className="p-4 pb-2 space-y-0">
                <div className="flex justify-between items-start">
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[10px] text-muted-foreground font-mono">#{task.id.slice(-4)}</span>
                        <CardTitle className="text-sm font-medium leading-none group-hover:text-indigo-600 transition-colors">{task.title}</CardTitle>
                    </div>
                    <GripVertical className="h-4 w-4 text-gray-400 group-hover:text-gray-600" />
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-2">
                <p className="text-xs text-muted-foreground line-clamp-2">{task.description}</p>
            </CardContent>
            <CardFooter className="p-4 pt-0 flex justify-between items-center text-[10px] text-gray-500">
                <span>{task.assignee?.name}</span>
                <span className={`px-1.5 py-0.5 rounded border ${task.priority === 'HIGH' ? 'border-red-200 bg-red-50 text-red-600' :
                    task.priority === 'MEDIUM' ? 'border-orange-200 bg-orange-50 text-orange-600' :
                        'border-blue-200 bg-blue-50 text-blue-600'
                    }`}>{task.priority}</span>
            </CardFooter>
        </Card>
    );
}
