"use client";

import { api } from "@/trpc/react";
import type { inferRouterOutputs } from "@trpc/server";
import { type AppRouter } from "@/server/api/root";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import React from "react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { ArrowUpDown, Download, ThumbsUp } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";

type LibraryItem = inferRouterOutputs<AppRouter>["audible"]["getLibrary"][0];

const columns: ColumnDef<LibraryItem>[] = [
  {
    accessorKey: "asin",
    header: "Asin",
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
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "downloadPercentage",
    header: "Download %",
  },
  {
    accessorKey: "downloadSpeed",
    header: "Speed",
  },
];

export function DataTable<TData, TValue>(props: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
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
    </div>
  );
}

export default function Home() {
  const library = api.audible.getLibrary.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const refreshApi = api.audible.doLibraryRefresh.useQuery(undefined, {
    enabled: false,
  });

  function doRefresh() {
    void refreshApi.refetch().then(() => library.refetch());
  }

  const { refetch: downloadAllQuery, isFetching: isDownloadingAllBooks } =
    api.audible.downloadAllBooks.useQuery(undefined, {
      enabled: false,
    });

  function downloadAll() {
    void downloadAllQuery().then(() => void library.refetch());
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      {library.isSuccess && <DataTable data={library.data} columns={columns} />}
    </div>
  );
}
