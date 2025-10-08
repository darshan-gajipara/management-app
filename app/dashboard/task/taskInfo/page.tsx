"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Edit, Eye } from "lucide-react";
import { Task, TaskRes, useTaskStore } from "@/store/useTaskStore";
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
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import CreateTaskComponent from "@/components/task/create-task/page";
import {
    CircularProgressbar,
    buildStyles,
} from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

// Status columns in Kanban
const statusColumns = ["Pending", "In Progress", "Completed", "On Hold"];

// Status color map
const statusColors: Record<string, string> = {
    Completed: "bg-green-100 text-green-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    Pending: "bg-orange-100 text-orange-700",
    "On Hold": "bg-gray-100 text-gray-700",
};

// ✅ Helper to check if two dates fall on the same *local* calendar day
const isSameLocalDate = (date1: Date, date2: Date) => {
    return (
        date1.getFullYear() === date2.getFullYear() &&
        date1.getMonth() === date2.getMonth() &&
        date1.getDate() === date2.getDate()
    );
};

// ✅ Calculate progress + stats for today's tasks (local timezone)
const calculateTodayStats = (tasks: Record<string, TaskRes[]>) => {
    const today = new Date();
    const allTasks = Object.values(tasks).flat();

    const tasksToday = allTasks.filter((t) =>
        isSameLocalDate(new Date(t.scheduledDate), today)
    );

    const completed = tasksToday.filter(
        (t) => t.currentStatus === "Completed"
    ).length;

    const pending = tasksToday.filter(
        (t) => t.currentStatus === "Pending" || t.currentStatus === "In Progress"
    ).length;

    const hold = tasksToday.filter((t) => t.currentStatus === "On Hold").length;

    const total = tasksToday.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, completed, pending, hold, progress };
};

export default function TaskBoard() {
    const { taskResponse, getAllTasks, updateTask, loading } = useTaskStore();

    const [localTasks, setLocalTasks] = useState<Record<string, TaskRes[]>>({});
    const [todayStats, setTodayStats] = useState({
        total: 0,
        completed: 0,
        pending: 0,
        hold: 0,
        progress: 0,
    });

    const sensors = useSensors(useSensor(PointerSensor));

    // ✅ Fetch all tasks once when component mounts
    useEffect(() => {
        const today = new Date();
        getAllTasks("", 1, 50, today);
    }, [getAllTasks]);

    // ✅ Group and calculate stats when tasks change
    useEffect(() => {
        if (taskResponse?.data) {
            const grouped: Record<string, TaskRes[]> = {};
            statusColumns.forEach((status) => {
                grouped[status] = taskResponse.data.filter(
                    (t) => t.currentStatus === status
                );
            });
            setLocalTasks(grouped);
            setTodayStats(calculateTodayStats(grouped));
        }
    }, [taskResponse]);

    // ✅ Handle Drag-and-Drop
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const handleDragEnd = (event: any) => {
        const { active, over } = event;
        if (!over) return;

        const taskId = active.id;
        let sourceColumn = "";
        let destinationColumn = "";

        // find which column task comes from
        for (const status of statusColumns) {
            if (localTasks[status]?.some((t) => t._id === taskId)) {
                sourceColumn = status;
            }
        }

        // find which column task goes to
        const overTask = Object.values(localTasks)
            .flat()
            .find((t) => t._id === over.id);
        if (overTask) {
            destinationColumn = overTask.currentStatus;
        } else {
            destinationColumn = over.id;
        }

        if (!sourceColumn || !destinationColumn) return;

        if (sourceColumn === destinationColumn) {
            const oldIndex = localTasks[sourceColumn].findIndex(
                (t) => t._id === taskId
            );
            const newIndex = localTasks[sourceColumn].findIndex(
                (t) => t._id === over.id
            );

            if (oldIndex !== -1 && newIndex !== -1) {
                const updatedTasks = {
                    ...localTasks,
                    [sourceColumn]: arrayMove(
                        localTasks[sourceColumn],
                        oldIndex,
                        newIndex
                    ),
                };
                setLocalTasks(updatedTasks);
                setTodayStats(calculateTodayStats(updatedTasks));
            }
        } else {
            const task = localTasks[sourceColumn].find((t) => t._id === taskId);
            if (!task) return;

            const updatedTasks = {
                ...localTasks,
                [sourceColumn]: localTasks[sourceColumn].filter(
                    (t) => t._id !== taskId
                ),
                [destinationColumn]: [
                    ...localTasks[destinationColumn],
                    { ...task, currentStatus: destinationColumn },
                ],
            };

            setLocalTasks(updatedTasks);
            setTodayStats(calculateTodayStats(updatedTasks));

            // ✅ Update backend
            const updatedTask = { ...task, currentStatus: destinationColumn };
            const taskPayload = {
                title: updatedTask?.title,
                description: updatedTask?.description,
                group: updatedTask?.group,
                currentStatus: updatedTask?.currentStatus,
                scheduledDate: updatedTask?.scheduledDate,
                assignedTo: updatedTask?.assignedTo?._id
            }
            updateTask(taskId, taskPayload);
        }
    };

    if (loading) return <LoaderComponent />;

    return (
        <div className="p-4 space-y-6">
            {/* ======== PROGRESS + STATS HEADER ======== */}
            <Card className="bg-[#1E1E2F] p-8 rounded-lg">
                <CardContent>
                    <div className="flex flex-wrap items-center justify-center gap-10">
                        {/* 🔵 Circular Progress */}
                        <div className="flex flex-col items-center">
                            <div className="w-20 h-20">
                                <CircularProgressbar
                                    value={todayStats.progress}
                                    text={`${todayStats.progress}%`}
                                    styles={buildStyles({
                                        textColor: "#22c55e",
                                        pathColor: "#22c55e",
                                        trailColor: "#1E293B",
                                        pathTransitionDuration: 0.5,
                                    })}
                                />
                            </div>
                            <p className="mt-2 text-sm text-gray-300">
                                Today’s Completion
                            </p>
                        </div>

                        {/* 📊 Stats Section */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                            <div className="bg-slate-800 px-4 py-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-400">Total Tasks</p>
                                <p className="text-xl font-semibold text-white">
                                    {todayStats.total}
                                </p>
                            </div>

                            <div className="bg-slate-800 px-4 py-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-400">Completed</p>
                                <p className="text-xl font-semibold text-green-400">
                                    {todayStats.completed}
                                </p>
                            </div>

                            <div className="bg-slate-800 px-4 py-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-400">Pending / In Progress</p>
                                <p className="text-xl font-semibold text-yellow-400">
                                    {todayStats.pending}
                                </p>
                            </div>

                            <div className="bg-slate-800 px-4 py-3 rounded-lg shadow-sm border">
                                <p className="text-sm text-gray-400">On Hold</p>
                                <p className="text-xl font-semibold text-gray-400">
                                    {todayStats.hold}
                                </p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* ======== KANBAN BOARD ======== */}
            <DndContext
                sensors={sensors}
                collisionDetection={closestCorners}
                onDragEnd={handleDragEnd}
            >
                <div className="grid grid-cols-4 gap-4">
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
        </div>
    );
}

/* ========================
   Column Component
======================== */
function Column({
    id,
    title,
    tasks,
}: {
    id: string;
    title: string;
    tasks: TaskRes[];
}) {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div
            ref={setNodeRef}
            className="bg-[#1E1E2F] p-3 rounded-lg min-h-[200px] border"
        >
            <h2 className="text-lg font-bold mb-3 text-white">{title}</h2>

            <SortableContext
                items={tasks.map((t) => t._id)}
                strategy={verticalListSortingStrategy}
            >
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
   Task Card Component
======================== */
function SortableTaskCard({ task }: { task: TaskRes }) {
    const { attributes, listeners, setNodeRef, transform } = useDraggable({
        id: task._id,
    });

    const style = {
        transform: transform
            ? `translate3d(${transform.x}px, ${transform.y}px, 0)`
            : undefined,
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
                            {/* 👁 View Task */}
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
                                        <p><strong className="text-blue-400">Assigned To:</strong> <br />{(task.assignedTo?.firstName) + " " + (task.assignedTo?.lastName)}</p>
                                        <p><strong className="text-blue-400">Group:</strong> <br />{task.group}</p>
                                        <p><strong className="text-blue-400">Current Status:</strong> <br />{task.currentStatus}</p>
                                        <p><strong className="text-blue-400">Scheduled Date:</strong> <br />{dateFormat(task.scheduledDate)}</p>
                                        <p><strong className="text-blue-400">Created At:</strong> <br />{task?.createdAt ? dateFormat(task?.createdAt) : "-"}</p>
                                    </div>
                                    <DialogFooter>
                                        <DialogClose asChild>
                                            <Button variant="secondary">Close</Button>
                                        </DialogClose>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>

                            {/* ✏️ Edit Task */}
                            <Dialog>
                                <DialogTrigger asChild>
                                    <Edit className="h-5 w-5 text-blue-500 cursor-pointer" />
                                </DialogTrigger>
                                <DialogContent className="max-w-lg">
                                    <DialogHeader>
                                        <DialogTitle>Update Task</DialogTitle>
                                    </DialogHeader>
                                    <CreateTaskComponent
                                        taskID={task._id}
                                        closeBtnRef={closeBtnRef}
                                        date={task.scheduledDate}
                                    />
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
