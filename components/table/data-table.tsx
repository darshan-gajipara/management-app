"use client"

import * as React from "react"
import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    useReactTable,
    getPaginationRowModel,
    SortingState,
    getSortedRowModel,
    ColumnFiltersState,
    getFilteredRowModel,
    FilterFn,
    VisibilityState,
    getExpandedRowModel
    // ColumnResizeMode
} from "@tanstack/react-table"

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
// import {
//     DropdownMenu,
//     DropdownMenuCheckboxItem,
//     DropdownMenuContent,
//     DropdownMenuTrigger,
// } from "@/components/ui/dropdown-menu"

// simple string contains filter
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const globalFilterFn: FilterFn<any> = (row, columnId, filterValue) => {
    const value = row.getValue<string>(columnId)
    return String(value).toLowerCase().includes(String(filterValue).toLowerCase())
}

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
}

export function DataTable<TData, TValue>({
    columns,
    data,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [globalFilter, setGlobalFilter] = React.useState("")
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})
    // const [columnResizeMode] = React.useState<ColumnResizeMode>("onChange")
    const [columnSizing, setColumnSizing] = React.useState({})
    // const [expanded, setExpanded] = React.useState({})



    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        initialState: {
            pagination: { pageSize: 10 }
        },
        onSortingChange: setSorting,
        getSortedRowModel: getSortedRowModel(),
        onColumnFiltersChange: setColumnFilters,
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        getExpandedRowModel: getExpandedRowModel(),
        state: {
            sorting,
            columnFilters,
            globalFilter,
            columnVisibility,
            rowSelection,
            columnSizing,
            // expanded
        },
        onGlobalFilterChange: setGlobalFilter,
        globalFilterFn,
        // columnResizeMode,
        onColumnSizingChange: setColumnSizing,
        columnResizeMode: "onChange",
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        getSubRows: (row: any) => row.subRows,
    })

    return (
        <div className="overflow-hidden rounded-md border">
            <div className="flex gap-2 p-4">
                <div className="flex items-center py-4 w-100">
                    <Input
                        placeholder="Search all columns..."
                        value={globalFilter ?? ""}
                        onChange={(event) => setGlobalFilter(event.target.value)}
                        className="max-w-sm"
                    />
                </div>
            </div>
            <Table className="table-fixed w-full">
                <TableHeader>
                    {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                            {headerGroup.headers.map((header) => (
                                <TableHead
                                    key={header.id}
                                    style={{
                                        width: header.getSize(),
                                        color: "white"
                                    }}
                                    className="relative group"
                                >
                                    {header.isPlaceholder
                                        ? null
                                        : flexRender(
                                            header.column.columnDef.header,
                                            header.getContext()
                                        )}

                                    {/* Resize Handle */}
                                    {header.column.getCanResize() && (
                                        <div
                                            onMouseDown={header.getResizeHandler()}
                                            onTouchStart={header.getResizeHandler()}
                                            className="absolute right-0 top-0 h-full w-1 cursor-col-resize bg-transparent group-hover:bg-gray-400"
                                        />
                                    )}
                                </TableHead>
                            ))}
                        </TableRow>
                    ))}
                </TableHeader>
                <TableBody>
                    {table.getRowModel().rows?.length ? (
                        table.getRowModel().rows.map((row) => (
                            <TableRow key={row.id} data-state={row.getIsSelected() && "selected"}>
                                {row.getVisibleCells().map((cell) => (
                                    <TableCell key={cell.id}
                                        style={{ width: cell.column.getSize() }}
                                        className="overflow-hidden whitespace-nowrap text-ellipsis">
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={columns.length} className="h-24 text-center">
                                No results.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="flex items-center justify-end space-x-2 py-4">
                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                >
                    Previous
                </Button>

                {Array.from({ length: table.getPageCount() }, (_, i) => (
                    <Button
                        key={i}
                        variant={
                            table.getState().pagination.pageIndex === i
                                ? "default"
                                : "secondary"
                        }
                        size="sm"
                        onClick={() => table.setPageIndex(i)}
                    >
                        {i + 1}
                    </Button>
                ))}

                <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                >
                    Next
                </Button>
            </div>
        </div>

    )
}