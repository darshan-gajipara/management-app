"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";
import { Task, useTaskStore } from "@/store/useTaskStore";
import { useEffect, useRef, useState } from "react";
import LoaderComponent from "@/components/loader/page";

import {
    DndContext,
    closestCorners,
    PointerSensor,
    useSensor,
    useSensors,
    useDroppable,
    useDraggable,
} from "@dnd-kit/core";
import {
    SortableContext,
    arrayMove,
    verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import dateFormat from "@/lib/util/dateFormat";
import { Dialog, DialogClose, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskComponent from "@/components/task/create-task/page";

const statusColumns = ["Pending", "In Progress", "Completed", "On Hold"];

const statusColors: Record<string, string> = {
    "Completed": "bg-green-100 text-green-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "Pending": "bg-orange-100 text-orange-700",
    "On Hold": "bg-gray-100 text-gray-700",
};

export default function TaskBoard() {
    const { taskResponse, getAllTasks, updateTask, loading } = useTaskStore();

    const [localTasks, setLocalTasks] = useState<Record<string, Task[]>>({});

    useEffect(() => {
        const today = new Date();
        getAllTasks("", 1, 20, today);
    }, [getAllTasks]);

    useEffect(() => {
        if (taskResponse?.data) {
            // group tasks by status into local state
            const grouped: Record<string, Task[]> = {};
            statusColumns.forEach((status) => {
                grouped[status] = taskResponse.data.filter((t) => t.currentStatus === status);
            });
            setLocalTasks(grouped);
        }
    }, [taskResponse]);

    const sensors = useSensors(useSensor(PointerSensor));

    if (loading) return <LoaderComponent />;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        let sourceColumn = "";
        let destinationColumn = "";

        // find source column
        for (const status of statusColumns) {
            if (localTasks[status]?.some((t) => t._id === taskId)) {
                sourceColumn = status;
            }
        }

        // if over is a task, find its column
        const overTask = Object.values(localTasks).flat().find((t) => t._id === over.id);
        if (overTask) {
            destinationColumn = overTask.currentStatus;
        } else {
            // else it's a column drop
            destinationColumn = over.id;
        }

        if (!sourceColumn || !destinationColumn) return;

        // if same column → reorder
        if (sourceColumn === destinationColumn) {
            const oldIndex = localTasks[sourceColumn].findIndex((t) => t._id === taskId);
            const newIndex = localTasks[sourceColumn].findIndex((t) => t._id === over.id);

            if (oldIndex !== -1 && newIndex !== -1) {
                setLocalTasks((prev) => ({
                    ...prev,
                    [sourceColumn]: arrayMove(prev[sourceColumn], oldIndex, newIndex),
                }));
            }
        } else {
            // move to another column
            const task = localTasks[sourceColumn].find((t) => t._id === taskId);
            if (!task) return;

            setLocalTasks((prev) => {
                const sourceList = prev[sourceColumn].filter((t) => t._id !== taskId);
                const destinationList = [...prev[destinationColumn], { ...task, currentStatus: destinationColumn }];

                return {
                    ...prev,
                    [sourceColumn]: sourceList,
                    [destinationColumn]: destinationList,
                };
            });
            const updatedTask = {
                ...task,
                currentStatus: destinationColumn
            };
            // backend update
            updateTask(taskId, updatedTask);
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCorners}
            onDragEnd={handleDragEnd}
        >
            <div className="grid grid-cols-4 gap-4 p-4">
                {statusColumns.map((status) => (
                    <Column
                        key={status}
                        id={status}
                        title={status}
                        tasks={localTasks[status] || []}
                    />
                ))}
            </div>
        </DndContext>


    );
}

/* ========================
   Column Component
======================== */
function Column({ id, title, tasks }: { id: string; title: string; tasks: Task[] }) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="bg-[#1E1E2F] p-3 rounded-lg min-h-[200px]"
        >
            <h2 className="text-lg font-bold mb-3 text-white">{title}</h2>

            {/* ✅ Only this SortableContext is needed */}
            <SortableContext items={tasks.map((t) => t._id)} strategy={verticalListSortingStrategy}>
                <div className="space-y-3">
                    {tasks.map((task) => (
                        <SortableTaskCard key={task._id} task={task} />
                    ))}
                </div>
            </SortableContext>
        </div>
    );
}


/* ========================
   Task Card (Sortable)
======================== */
function SortableTaskCard({ task }: { task: Task }) {
    const { attributes, listeners, setNodeRef, transform } =
        useDraggable({
            id: task._id,
        });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
        undefined,
    };
    const closeBtnRef = useRef<HTMLButtonElement>(null);


    return (
        <div ref={setNodeRef} style={style}>
            <Card className="rounded-2xl shadow-sm bg-slate-800 text-white py-0">
                <CardContent className="p-4 space-y-2">
                    <p className="text-sm text-blue-300">{task.group} Task</p>

                    <div className="flex items-center justify-between">
                        <p className="font-semibold text-lg">{task.title}</p>

                        <div className="flex items-center gap-2">
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Eye className="h-5 w-5 text-cyan-300 cursor-pointer" />
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[425px]">
                                    <DialogHeader>
                                        <DialogTitle>Task Details</DialogTitle>
                                    </DialogHeader>
                                    <div className="grid gap-2">
                                        <p><strong className="text-blue-400">Title:</strong> <br />{task.title}</p>
                                        <p><strong className="text-blue-400">Description:</strong> <br />{task.description}</p>
                                        <p><strong className="text-blue-400">Group:</strong> <br />{task.group}</p>
                                        <p><strong className="text-blue-400">Current Status:</strong> <br />{task.currentStatus}</p>
                                        <p><strong className="text-blue-400">Scheduled Date:</strong> <br />{dateFormat(task.scheduledDate)}</p>
                                        <p><strong className="text-blue-400">Created At:</strong> <br />{task?.createdAt ? dateFormat(task?.createdAt) : '-'}</p>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary">Close</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <Edit
                                        className="h-5 w-5 text-blue-500 cursor-pointer"
                                    />
                                </DialogTrigger>

                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Update Task</DialogTitle>
                                    </DialogHeader>
                                    {/* Render your create form here */}
                                    <CreateTaskComponent taskID={task._id} closeBtnRef={closeBtnRef} date={task.scheduledDate} />
                                    <DialogClose asChild>
                                        <button ref={closeBtnRef} style={{ display: "none" }} aria-hidden />
                                    </DialogClose>
                                </DialogContent>
                            </Dialog>

                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <Badge
                            className={`${statusColors[task.currentStatus] ?? "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full`}
                        >
                            {task.currentStatus}
                        </Badge>

                        {/* ✅ Add a drag handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab text-gray-400 hover:text-white ml-2"
                        >
                            ⠿
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>

    );
}
