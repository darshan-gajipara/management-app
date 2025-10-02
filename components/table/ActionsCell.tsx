import { Edit, Trash2 } from "lucide-react"
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
import { Report, useReportsStore } from "@/store/useReportStore"
import { useRef } from "react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CreateReportComponent from "../report/create-report/page";

// Create a small React component for the Actions cell
export const ActionsCell = ({ row }: { row: Report }) => {
    const deleteReport = useReportsStore((state) => state.deleteReport)
    const getAllReports = useReportsStore((state) => state.getAllReports)
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    const handleDelete = async (id: string) => {
        await deleteReport(id);
        await getAllReports();
    }

    return (
        <div className="text-center font-bold flex justify-start gap-3">
            {/* Edit icon */}

            <Dialog>
                <DialogTrigger asChild>
                    <Edit
                        className="h-5 w-5 text-blue-500 cursor-pointer"
                        onClick={() => console.log("Edit", row._id)}
                    />
                </DialogTrigger>

                <DialogContent className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Update Report</DialogTitle>
                    </DialogHeader>
                    {/* Render your create form here */}
                    <CreateReportComponent reportID={row._id} closeBtnRef={closeBtnRef} />
                    <DialogClose asChild>
                        <button ref={closeBtnRef} style={{ display: "none" }} aria-hidden />
                    </DialogClose>
                </DialogContent>
            </Dialog>

            {/* Delete icon with AlertDialog */}
            <AlertDialog>
                <AlertDialogTrigger asChild>
                    <Trash2 className="h-5 w-5 text-red-500 cursor-pointer" />
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            Are you sure you want to delete this data?
                        </AlertDialogTitle>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(row._id)}>
                            Continue
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    )
}
