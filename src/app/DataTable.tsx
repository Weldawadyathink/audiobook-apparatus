"use client";

import {
  type ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "@/server/api/root";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";

type LibraryItem = inferRouterOutputs<AppRouter>["audible"]["getLibrary"][0];

export const columns: ColumnDef<LibraryItem>[] = [
  {
    accessorKey: "asin",
    header: "asin",
  },
  {
    accessorKey: "source",
    header: "Source",
  },
  {
    accessorKey: "status",
    header: "Status",
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Title
          {column.getIsSorted() === false && (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "asc" && (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "desc" && (
            <ArrowDown className="ml-2 h-4 w-4" />
          )}{" "}
        </Button>
      );
    },
    enableHiding: false,
  },
  {
    accessorKey: "downloadPercentage",
    header: "Download %",
  },
  {
    accessorKey: "downloadSpeed",
    header: "Speed",
  },
  {
    accessorKey: "isDownloadable",
    header: "Downloadable",
  },
  {
    accessorKey: "author",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Author
          {column.getIsSorted() === false && (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "asc" && (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "desc" && (
            <ArrowDown className="ml-2 h-4 w-4" />
          )}{" "}
        </Button>
      );
    },
  },
  {
    accessorKey: "narrator",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Narrator
          {column.getIsSorted() === false && (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "asc" && (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "desc" && (
            <ArrowDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
  {
    accessorKey: "language",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Language
          {column.getIsSorted() === false && (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "asc" && (
            <ArrowUp className="ml-2 h-4 w-4" />
          )}
          {column.getIsSorted() === "desc" && (
            <ArrowDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      );
    },
  },
];

export function DataTable<TData, TValue>(props: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnVisibility,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="default" className="ml-auto">
              Columns
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {table
              .getAllColumns()
              .filter((column) => column.getCanHide())
              .map((column) => {
                return (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={column.getIsVisible()}
                    onCheckedChange={(value) => column.toggleVisibility(value)}
                  >
                    {column.id}
                  </DropdownMenuCheckboxItem>
                );
              })}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
