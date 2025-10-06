"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { Task, useTaskStore } from "@/store/useTaskStore";
import { useEffect } from "react";
import LoaderComponent from "@/components/loader/page";

const statusColors: Record<string, string> = {
    "Completed": "bg-green-100 text-green-700",
    "In Progress": "bg-yellow-100 text-yellow-700",
    "Pending": "bg-orange-100 text-orange-700",
    "On Hold": "bg-gray-100 text-gray-700",
};

export default function TodayTaskComponent() {
    const { taskResponse:tasks, getAllTasks, loading } = useTaskStore();
    useEffect(() => {
        const today = new Date();
        getAllTasks('', 1, 50, today);
    },[getAllTasks]);

    if (loading) {
        return <LoaderComponent />
    }

    return (
        <div className="p-4">
            <Tabs defaultValue="all" className="w-full" >
                {/* Tabs */}
                <TabsList className="grid grid-cols-5 gap-2 mb-4 text-white" style={{background:"#1e293b"}}>
                    <TabsTrigger className="text-white data-[state=active]:text-black" value="all">All</TabsTrigger>
                    <TabsTrigger className="text-white data-[state=active]:text-black" value="progress">In Progress</TabsTrigger>
                    <TabsTrigger className="text-white data-[state=active]:text-black" value="completed">Completed</TabsTrigger>
                    <TabsTrigger className="text-white data-[state=active]:text-black" value="pending">Pending</TabsTrigger>
                    <TabsTrigger className="text-white data-[state=active]:text-black" value="hold">On Hold</TabsTrigger>
                </TabsList>

                {/* Tab Contents */}
                <TabsContent value="all" className="space-y-4">
                    {tasks?.data.map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </TabsContent>

                <TabsContent value="progress" className="space-y-4">
                    {tasks?.data.filter((t) => t.currentStatus === "In Progress").map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </TabsContent>

                <TabsContent value="completed" className="space-y-4">
                    {tasks?.data.filter((t) => t.currentStatus === "Completed").map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </TabsContent>

                <TabsContent value="pending" className="space-y-4">
                    {tasks?.data.filter((t) => t.currentStatus === "To-do" || t.currentStatus === "Pending").map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </TabsContent>

                <TabsContent value="hold" className="space-y-4">
                    {tasks?.data.filter((t) => t.currentStatus === "On Hold").map((task) => (
                        <TaskCard key={task._id} task={task} />
                    ))}
                </TabsContent>
            </Tabs>
        </div>
    );
}

// Task Card Component
function TaskCard({ task }: { task: Task }) {
    return (
        <Card className="rounded-2xl shadow-sm bg-slate-800 text-white">
            <CardContent className="p-4 space-y-2">
                <p className="text-sm text-blue-300">{task.group} Task</p>
                <p className="font-semibold text-lg">{task.title}</p>
                <div className="flex items-center justify-between">
                    <div className="flex items-center text-sm text-blue-300">
                        <Clock className="w-4 h-4 mr-1 text-blue-300" />
                        {format(new Date(task.scheduledDate), "hh:mm a")}
                    </div>
                    <Badge className={`${statusColors[task.currentStatus] ?? "bg-gray-100 text-gray-700"} px-3 py-1 rounded-full`}>
                        {task.currentStatus}
                    </Badge>
                </div>
            </CardContent>
        </Card>
    );
}
