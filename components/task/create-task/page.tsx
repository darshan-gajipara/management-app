"use client";

import { Button } from "@/components/ui/button";
import { CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { useForm, Controller } from "react-hook-form";
import { CalendarIcon } from "lucide-react";
import { useEffect } from "react";
import axios from "axios";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useTaskStore } from "@/store/useTaskStore";
import LoaderComponent from "@/components/loader/page";
import { useState } from "react";

type TaskForm = {
    title: string;
    description: string;
    group: string;
    currentStatus: string;
    scheduledDate: Date;
};

type Props = {
    closeBtnRef?: React.RefObject<HTMLButtonElement | null>;
    taskID?: string;
    date?: string;
};

export default function CreateTaskComponent({ taskID, closeBtnRef, date }: Props) {
    const { addtask, getAllTasks, updateTask, loading } = useTaskStore();
    const [open, setOpen] = useState(false);
    const {
        register,
        handleSubmit,
        setValue,
        control,
        formState: { errors },
    } = useForm<TaskForm>();

    useEffect(() => {
        if (!taskID) return;

        const token = localStorage.getItem("token");

        const config = token
            ? {
                headers: { Authorization: `Bearer ${token}` },
            }
            : {};

        axios
            .get(`${process.env.NEXT_PUBLIC_BACKEND_BASE_URL}/task/get/${taskID}`, config)
            .then((res) => {
                console.log(res.data);
                const report = res.data;
                setValue("title", report.title);
                setValue("description", report.description);
                setValue("group", report.group);
                setValue("currentStatus", report.currentStatus);
                setValue("scheduledDate", new Date(report.scheduledDate));
            })
            .catch((err) => console.log(err));
    }, [taskID, setValue]);

    const onSubmit = async (data: TaskForm) => {
        const localDate = new Date(data.scheduledDate);
        // remove timezone offset effect
        const correctedDate = new Date(localDate.getTime() - localDate.getTimezoneOffset() * 60000);

        const payload = {
            ...data,
            scheduledDate: correctedDate.toISOString(), // now stays as selected day
        };

        if (!taskID) {
            await addtask(payload);
        } else {
            await updateTask(taskID!, payload);
        }

        await getAllTasks("", 1, 10, date ? new Date(date) : undefined);

        if (closeBtnRef?.current) {
            closeBtnRef.current.click();
        }
    };


    return (
        <div className="w-full">
            {loading && <LoaderComponent />}
            <CardHeader className="pb-4" />
            <CardContent className="space-y-4 max-h-[70vh] overflow-y-auto">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    {/* Title */}
                    <div className="grid gap-2">
                        <Label>Title</Label>
                        <Input {...register("title", { required: true })} type="text" />
                        {errors.title && (
                            <p className="text-red-500 text-sm">Title is required</p>
                        )}
                    </div>

                    {/* description */}
                    <div className="grid gap-2">
                        <Label>Description</Label>
                        <Textarea {...register("description", { required: true })} />
                        {errors.description && (
                            <p className="text-red-500 text-sm">Description is required</p>
                        )}
                    </div>

                    {/* Group */}
                    <div className="grid gap-2">
                        <Label>Group</Label>
                        <Controller
                            name="group"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select group" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Finance">Finance</SelectItem>
                                        <SelectItem value="HR">HR</SelectItem>
                                        <SelectItem value="IT">IT</SelectItem>
                                        <SelectItem value="Sales">Sales</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.group && (
                            <p className="text-red-500 text-sm">Group is required</p>
                        )}
                    </div>

                    {/* CurrentStatus */}
                    <div className="grid gap-2">
                        <Label>Current Status</Label>
                        <Controller
                            name="currentStatus"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => (
                                <Select onValueChange={field.onChange} value={field.value}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select current Status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Pending">Pending</SelectItem>
                                        <SelectItem value="In Progress">In Progress</SelectItem>
                                        <SelectItem value="Completed">Completed</SelectItem>
                                        <SelectItem value="On Hold">On Hold</SelectItem>
                                    </SelectContent>
                                </Select>
                            )}
                        />
                        {errors.currentStatus && (
                            <p className="text-red-500 text-sm">
                                Current Status is required
                            </p>
                        )}
                    </div>

                    {/* Scheduled Date (Date Picker) */}
                    <div className="grid gap-2">
                        <Label>Scheduled Date</Label>
                        <Controller
                            name="scheduledDate"
                            control={control}
                            rules={{ required: true }}
                            render={({ field }) => {

                                return (
                                    <Popover open={open} onOpenChange={setOpen}>
                                        <PopoverTrigger asChild>
                                            <Button
                                                type="button"
                                                variant="outline"
                                                style={{ background: "#1e293b", color: "white" }}
                                                className={cn(
                                                    "w-full justify-start text-left font-normal",
                                                    !field.value && "text-muted-foreground"
                                                )}
                                                onClick={() => setOpen(true)}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {field.value ? (
                                                    format(field.value, "PPP")
                                                ) : (
                                                    <span>Pick a date</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0" align="start">
                                            <Calendar
                                                mode="single"
                                                selected={field.value}
                                                onSelect={(date) => {
                                                    field.onChange(date);
                                                    setOpen(false); // ✅ close popup when date selected
                                                }}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                );
                            }}
                        />
                        {errors.scheduledDate && (
                            <p className="text-red-500 text-sm">Scheduled date is required</p>
                        )}
                    </div>

                    {/* Buttons */}
                    <div className="flex gap-2 justify-end pt-4">
                        {taskID ? (
                            <Button type="submit" variant="secondary">
                                Update
                            </Button>
                        ) : (
                            <Button type="submit" variant="secondary">
                                Create
                            </Button>
                        )}
                    </div>
                </form>
            </CardContent>
        </div>
    );
}
