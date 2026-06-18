"use client";

import { useState, useEffect } from "react";
import {
    DndContext,
    DragOverlay,
    closestCorners,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragOverEvent,
    DragEndEvent,
    defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import { SortableContext, sortableKeyboardCoordinates, horizontalListSortingStrategy, arrayMove } from "@dnd-kit/sortable";
import { moveTask, deleteSection, reorderSections } from "@/app/actions/board";
import { Column } from "./Column";
import { TaskCard } from "./TaskCard";
import { TaskDetailModal } from "./TaskDetailModal";
import { Button } from "@/app/components/ui/Button";
import { Modal } from "@/app/components/ui/Modal";
import { useRouter } from "next/navigation";

interface BoardProps {
    initialSections: any[];
    initialTasks: any[];
    currentUserId: string;
    currentUserRole: string;
    groups: { id: string; name: string }[];
}

export function Board({ initialSections, initialTasks, currentUserId, currentUserRole, groups }: BoardProps) {
    const router = useRouter();
    const [tasks, setTasks] = useState(initialTasks);
    const [sections, setSections] = useState(initialSections);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [activeSectionId, setActiveSectionId] = useState<string | null>(null);

    // Sync tasks when filters change (initialTasks prop updates)
    useEffect(() => {
        setTasks(initialTasks);
    }, [initialTasks]);

    // Delete Confirmation State
    const [sectionToDelete, setSectionToDelete] = useState<string | null>(null);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: {
                distance: 8,
            },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const getTasksBySection = (sectionId: string) => {
        if (sectionId === "unassigned") {
            return tasks.filter((t: any) => !t.sectionId);
        }
        return tasks.filter((t: any) => t.sectionId === sectionId);
    };

    const handleDragStart = (event: DragStartEvent) => {
        if (event.active.data.current?.type === "Column") {
            setActiveSectionId(event.active.id as string);
            return;
        }
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        // If dragging a column, we don't need complex drag over logic usually
        if (active.data.current?.type === "Column") return;
    };

    const handleDragEnd = async (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveId(null);
        setActiveSectionId(null);

        if (!over) return;

        // Handle Column Reorder
        if (active.data.current?.type === "Column") {
            if (active.id !== over.id) {
                const oldIndex = sections.findIndex((s: any) => s.id === active.id);
                const newIndex = sections.findIndex((s: any) => s.id === over.id);

                const newSections = arrayMove(sections, oldIndex, newIndex);
                setSections(newSections); // Optimistic

                // Persist
                const updates = newSections.map((s: any, index: number) => ({
                    id: s.id,
                    order: index
                }));

                await reorderSections(updates);
            }
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        const task = tasks.find((t: any) => t.id === activeId);
        if (!task) return;

        let targetSectionId = overId;

        // If we dropped over a task, find that task's section
        const overTask = tasks.find((t: any) => t.id === overId);
        if (overTask) {
            targetSectionId = overTask.sectionId || "unassigned";
        }

        // Check if we dropped over a Column directly (important for empty columns)
        const overSection = sections.find((s: any) => s.id === overId);
        if (overSection) {
            targetSectionId = overSection.id;
        }
        if (overId === "unassigned") {
            targetSectionId = "unassigned";
        }

        // Optimistic update
        if (task.sectionId !== targetSectionId) {
            setTasks((prev: any) => prev.map((t: any) => {
                if (t.id === activeId) {
                    return { ...t, sectionId: targetSectionId === "unassigned" ? null : targetSectionId };
                }
                return t;
            }));

            await moveTask(activeId, targetSectionId === "unassigned" ? "" : targetSectionId);
        }
    };

    const confirmDeleteSection = (id: string) => {
        setSectionToDelete(id);
        setIsDeleteModalOpen(true);
    };

    const handleDeleteSection = async () => {
        if (!sectionToDelete) return;

        // Optimistic delete
        setSections(sections.filter((s: any) => s.id !== sectionToDelete));
        setIsDeleteModalOpen(false);
        setSectionToDelete(null);

        const res = await deleteSection(sectionToDelete);
        if (res?.error) {
            alert(res.error);
            router.refresh();
        } else {
            router.refresh();
        }
    };

    const activeTask = tasks.find((t: any) => t.id === activeId);
    const [selectedTask, setSelectedTask] = useState<any>(null);

    // Sync URL with selected task
    useEffect(() => {
        if (selectedTask) {
            const url = new URL(window.location.href);
            url.searchParams.set("taskId", selectedTask.id);
            window.history.pushState({}, "", url);
        } else {
            const url = new URL(window.location.href);
            if (url.searchParams.has("taskId")) {
                url.searchParams.delete("taskId");
                window.history.pushState({}, "", url);
            }
        }
    }, [selectedTask]);

    // Check URL on load
    useEffect(() => {
        const urlParam = new URLSearchParams(window.location.search).get("taskId");
        if (urlParam) {
            const task = tasks.find((t: any) => t.id === urlParam);
            if (task) {
                setSelectedTask(task);
            }
        }
    }, [tasks]);

    // Keep selected task data in sync when tasks update (comments, attachments, filters)
    useEffect(() => {
        if (selectedTask) {
            const updated = tasks.find((t: any) => t.id === selectedTask.id);
            if (updated) {
                setSelectedTask(updated);
            }
        }
    }, [tasks]);

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
    };

    return (
        <div className="flex flex-col h-full">
            <DndContext
                id="kanban-board"
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragStart={handleDragStart}
                onDragOver={handleDragOver}
                onDragEnd={handleDragEnd}
            >
                <div className="flex h-full gap-4 overflow-x-auto pb-4 px-4">
                    <Column
                        id="unassigned"
                        title="Backlog"
                        tasks={getTasksBySection("unassigned")}
                        onTaskClick={handleTaskClick}
                    />

                    <SortableContext items={sections.map((s: any) => s.id)} strategy={horizontalListSortingStrategy}>
                        {sections.map((section: any) => (
                            <Column
                                key={section.id}
                                id={section.id}
                                title={section.title}
                                tasks={getTasksBySection(section.id)}
                                onDelete={currentUserRole === "ADMIN" ? () => confirmDeleteSection(section.id) : undefined}
                                onTaskClick={handleTaskClick}
                            />
                        ))}
                    </SortableContext>
                </div>

                <DragOverlay dropAnimation={{
                    sideEffects: defaultDropAnimationSideEffects({
                        styles: {
                            active: { opacity: '0.5' },
                        },
                    }),
                }}>
                    {activeId ? (
                        activeTask ? <TaskCard task={activeTask} isOverlay /> : null
                    ) : activeSectionId ? (
                        <div className="flex h-full w-[350px] min-w-[350px] flex-col rounded-xl bg-gray-50 border border-gray-200 shadow-xl opacity-80 cursor-grabbing pointer-events-none">
                            <div className="flex items-center justify-between p-4 border-b border-gray-200">
                                <h3 className="font-semibold text-gray-900">{sections.find((s: any) => s.id === activeSectionId)?.title}</h3>
                            </div>
                        </div>
                    ) : null}
                </DragOverlay>
            </DndContext>

            {/* Delete Confirmation Modal */}
            <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Delete Section">
                <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                        Are you sure you want to delete this section? All tasks in this section will be moved to the Backlog. This action cannot be undone.
                    </p>
                    <div className="flex justify-end gap-2">
                        <Button variant="ghost" onClick={() => setIsDeleteModalOpen(false)}>Cancel</Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white shadow-none border-0"
                            onClick={handleDeleteSection}
                        >
                            Delete
                        </Button>
                    </div>
                </div>
            </Modal>

            <TaskDetailModal
                task={selectedTask}
                isOpen={!!selectedTask}
                onClose={() => setSelectedTask(null)}
                currentUserId={currentUserId}
                groups={groups}
                sectionMap={Object.fromEntries(sections.map((s: any) => [s.id, s.title]))}
            />
        </div>
    );
}
