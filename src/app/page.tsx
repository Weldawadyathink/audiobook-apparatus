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
import { Download, ThumbsUp } from "lucide-react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
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
    header: "Title",
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

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
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

function LibraryRow(params: {
  book: LibraryItem;
  onStartDownload?: () => void;
}) {
  const { refetch } = api.audible.downloadBook.useQuery(params.book.asin!, {
    enabled: false,
  });

  function download() {
    void refetch().then(() => {
      if (params.onStartDownload) {
        params.onStartDownload();
      }
    });
  }
  return (
    <TableRow>
      <TableCell>{params.book.asin}</TableCell>
      <TableCell>{params.book.title}</TableCell>
      {params.book.status === "Downloading" &&
      params.book.downloadPercentage ? (
        <TableCell>
          Downloaded {params.book.downloadPercentage}% (
          {params.book.downloadSpeed})
        </TableCell>
      ) : (
        <TableCell>{params.book.status}</TableCell>
      )}
      <TableCell>
        {params.book.status === "Not Downloaded" && (
          <Button onClick={download}>
            <Download />
          </Button>
        )}
        {params.book.status === "Downloading" && <LoadingSpinner />}
        {params.book.status === "Complete" && <ThumbsUp />}
      </TableCell>
    </TableRow>
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

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <div className="flex flex-row gap-6">
        <Button disabled={refreshApi.isFetching} onClick={doRefresh}>
          {refreshApi.isFetching ? <LoadingSpinner /> : "Refresh Library"}
        </Button>
        <Button disabled={isDownloadingAllBooks} onClick={downloadAll}>
          {isDownloadingAllBooks ? <LoadingSpinner /> : "Download everything"}
        </Button>
      </div>
      {library.isLoading && <span>Loading</span>}
      {library.isSuccess && (
        <Table>
          <TableCaption>Audible Library</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ASIN</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {library.data.map((item) => (
              <LibraryRow
                key={item.id}
                book={item}
                onStartDownload={() => library.refetch()}
              ></LibraryRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
