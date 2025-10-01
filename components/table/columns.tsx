import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown } from "lucide-react"
import { Report } from "@/store/useReportStore"
import { ActionsCell } from "./ActionsCell"

export const columns: ColumnDef<Report>[] = [
    {
        accessorKey: "title",
        header: ({ column }) => (
            <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Title <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        enableResizing: true,
        size: 120,
        minSize: 30,
        maxSize: 300,
    },
    {
        accessorKey: "content",
        header: "Content",
        enableResizing: true,
        size: 120,
        minSize: 30,
        maxSize: 300,
    },
    {
        accessorKey: "author",
        header: ({ column }) => (
            <div
                className="flex items-center cursor-pointer select-none"
                onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            >
                Author <ArrowUpDown className="ml-2 h-4 w-4" />
            </div>
        ),
        enableResizing: true,
        size: 120,
        minSize: 30,
        maxSize: 300,
    },
    {
        accessorKey: "type",
        header: "Type",
        enableResizing: true,
        size: 120,
        minSize: 30,
        maxSize: 300,
    },
    {
        accessorKey: "status",
        cell: ({ row }) => {
            const status = row.getValue("status") as boolean
            return (
                <div className="text-center font-bold flex justify-start">
                    {status ? <p className="text-emerald-500">Active</p> : <p className="text-red-500">Inactive</p>}
                </div>
            )
        },
        header: "Status",
        enableResizing: true,
        size: 120,
        minSize: 30,
        maxSize: 300,
    },
    {
  id: "actions",
  header: "Actions",
  cell: ({ row }) => <ActionsCell row={row.original} />, // wrap row.original
  enableResizing: true,
  size: 120,
  minSize: 30,
  maxSize: 300,
}

]
