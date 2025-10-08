"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useEffect, useRef, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    Pagination,
    PaginationContent,
    PaginationItem,
} from "@/components/ui/pagination"
import { useTaskStore } from "@/store/useTaskStore";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Edit, Eye, Trash2 } from "lucide-react";
import dateFormat from "@/lib/util/dateFormat";
import LoaderComponent from "@/components/loader/page";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import CreateTaskComponent from "@/components/task/create-task/page";


export default function TaskPage() {
    const { taskResponse, getAllTasks, deleteTask, loading } = useTaskStore();
    const closeBtnRef = useRef<HTMLButtonElement>(null);
    const [page, setPage] = useState<number>(1);
    const [limit, setLimit] = useState<number>(10);
    const [quarry, setQuarry] = useState<string>("");

    useEffect(() => {
        getAllTasks();
    }, [getAllTasks])

    const handleDelete = async (id: string) => {
        deleteTask(id);
        setPage(1);
        setLimit(10);
        setQuarry("");
        getAllTasks();
    }

    const handleSearch = (value: string) => {
        setQuarry(value)
        getAllTasks(value, page, limit);
    }

    if (loading) { return <LoaderComponent /> }


    return (
        <div>
            <div className="container mx-auto py-10 border border-gray-300 rounded-lg px-5">
                <div className="flex justify-between pb-4">
                    <Input
                        placeholder="Search..."
                        className="flex items-center py-4 w-100 border"
                        onChange={(e) => handleSearch(e.target.value)}
                    />
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary">+ Create Task</Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create a New Task</DialogTitle>
                            </DialogHeader>
                            <CreateTaskComponent closeBtnRef={closeBtnRef} />



                            <DialogClose asChild>
                                <button ref={closeBtnRef} style={{ display: "none" }} aria-hidden />
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
                </div>

                <Table>
                    <TableCaption>A list of tasks.</TableCaption>
                    <TableHeader>
                        <TableRow >
                            <TableHead className="text-white font-bold">Title</TableHead>
                            <TableHead className="text-white font-bold">Group</TableHead>
                            <TableHead className="text-white font-bold">Status</TableHead>
                            <TableHead className="text-white font-bold">Scheduled Date</TableHead>
                            <TableHead className="text-white font-bold">Created At</TableHead>
                            <TableHead className="text-white font-bold">Actions</TableHead>
                        </TableRow>
                    </TableHeader>

                    <TableBody>
                        {!taskResponse || taskResponse?.data?.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} className="text-center">
                                    No record found..
                                </TableCell>
                            </TableRow>
                        ) : (
                            taskResponse.data.map((task) => (
                                <TableRow key={task._id}>
                                    <TableCell className="font-medium">{task?.title}</TableCell>
                                    <TableCell>{task?.group}</TableCell>
                                    <TableCell>
                                        <span
                                            className={
                                                task?.currentStatus === "Completed"
                                                    ? "text-green-600"
                                                    : task?.currentStatus === "Pending"
                                                        ? "text-yellow-600"
                                                        : task?.currentStatus === "In Progress"
                                                            ? "text-fuchsia-600"
                                                            : task?.currentStatus === "On Hold"
                                                                ? "text-white"
                                                                : "text-gray-800"
                                            }
                                        >
                                            {task?.currentStatus}
                                        </span>
                                    </TableCell>

                                    <TableCell>{dateFormat(task?.scheduledDate)}</TableCell>
                                    <TableCell>{task?.createdAt ? dateFormat(task?.createdAt) : '-'}</TableCell>
                                    <TableCell className="flex gap-2">
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
                                                    <p><strong className="text-blue-400">Scheduled Date:</strong>  <br />{dateFormat(task.scheduledDate)}</p>
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
                                                <CreateTaskComponent taskID={task._id} closeBtnRef={closeBtnRef} />
                                                <DialogClose asChild>
                                                    <button ref={closeBtnRef} style={{ display: "none" }} aria-hidden />
                                                </DialogClose>
                                            </DialogContent>
                                        </Dialog>

                                        <AlertDialog>
                                            <AlertDialogTrigger asChild>
                                                <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" />
                                            </AlertDialogTrigger>
                                            <AlertDialogContent>
                                                <AlertDialogHeader>
                                                    <AlertDialogTitle>Are You sure you want to delete this data ?</AlertDialogTitle>
                                                </AlertDialogHeader>
                                                <AlertDialogFooter>
                                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                    <AlertDialogAction onClick={() => handleDelete(task._id)}>Continue</AlertDialogAction>
                                                </AlertDialogFooter>
                                            </AlertDialogContent>
                                        </AlertDialog>

                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>

                <div className="flex items-center justify-between mt-4">
                    <Pagination>
                        <PaginationContent>
                            {/* Previous button */}
                            <PaginationItem>
                                <Button
                                    variant="secondary"
                                    disabled={page === 1}
                                    onClick={() => {
                                        const newPage = Math.max(1, page - 1);
                                        setPage(newPage);
                                        getAllTasks(quarry, newPage, limit);
                                    }}
                                >
                                    Previous
                                </Button>
                            </PaginationItem>

                            {/* Page numbers */}
                            {Array.from({ length: taskResponse?.pagination?.totalPages || 1 }).map(
                                (_, index) => {
                                    const pageNumber = index + 1;
                                    return (
                                        <PaginationItem key={pageNumber}>
                                            <Button
                                                variant={page === pageNumber ? "default" : "secondary"}
                                                onClick={() => {
                                                    setPage(pageNumber);
                                                    getAllTasks(quarry, pageNumber, limit);
                                                }}
                                            >
                                                {pageNumber}
                                            </Button>
                                        </PaginationItem>
                                    );
                                }
                            )}

                            {/* Next button */}
                            <PaginationItem>
                                <Button
                                    variant="secondary"
                                    disabled={page === taskResponse?.pagination?.totalPages}
                                    onClick={() => {
                                        const newPage = Math.min(
                                            taskResponse?.pagination?.totalPages ?? 1,
                                            page + 1
                                        );
                                        setPage(newPage);
                                        getAllTasks(quarry, newPage, limit);
                                    }}
                                >
                                    Next
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    <div className="w-[100px]">
                        <Select
                            value={limit.toString()}
                            onValueChange={(value) => {
                                const newLimit = parseInt(value, 10);
                                setLimit(newLimit);
                                setPage(1); // reset to first page when limit changes
                                getAllTasks(quarry, 1, newLimit);
                            }}
                        >
                            <SelectTrigger className="w-[100px]">
                                <SelectValue placeholder="Page Size" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="5">5</SelectItem>
                                <SelectItem value="10">10</SelectItem>
                                <SelectItem value="15">15</SelectItem>
                                <SelectItem value="20">20</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            </div>
            {/* <TodayTaskComponent /> */}
        </div>
    )
}