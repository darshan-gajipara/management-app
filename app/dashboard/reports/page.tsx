"use client";

import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import CreateReportComponent from "../create-report/page";
import { useEffect, useRef } from "react";
import { columns } from "@/components/table/columns";
import { DataTable } from "@/components/table/data-table";
import { useReportsStore } from "@/store/useReportStore";
import { Loader } from "lucide-react";


export default function ReportsPage() {
    
    const { reportResponse, getAllReports, loading } = useReportsStore();

    const closeBtnRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        getAllReports();
    }, [getAllReports]);

    return (
        <div>
            {loading && <Loader size={32} className="mx-auto mb-4 animate-spin" />}
            <div className="container mx-auto py-10">
            <div className="flex justify-end pb-4">
                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="secondary">+ Create Report</Button>
                        </DialogTrigger>

                        <DialogContent className="max-w-lg">
                            <DialogHeader>
                                <DialogTitle>Create a New Report</DialogTitle>
                            </DialogHeader>

                            {/* Render your create form here */}
                            <CreateReportComponent closeBtnRef={closeBtnRef} />
                            <DialogClose asChild>
                                <button ref={closeBtnRef} style={{ display: "none" }} aria-hidden />
                            </DialogClose>
                        </DialogContent>
                    </Dialog>
            </div>
                <DataTable columns={columns} data={reportResponse?.data ?? []} />
            </div>
        </div>
    );
}
