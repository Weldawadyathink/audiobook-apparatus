import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
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
} from "./ui/dropdown-menu.tsx";
import { Button } from "./ui/button.tsx";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table.tsx";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { Input } from "./ui/input.tsx";
import { type LibraryItem } from "../../../server/routers/audible.ts";

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
    id: "language",
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
    cell: ({ row }) => (
      <span className="capitalize">{row.getValue("language")}</span>
    ),
  },
];

export function DataTable(props: {
  columns: ColumnDef<LibraryItem>[];
  data: LibraryItem[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({
      isDownloadable: false,
      downloadPercentage: false,
      downloadSpeed: false,
    });
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    [],
  );

  const table = useReactTable({
    data: props.data,
    columns: props.columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnVisibility,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center py-4">
        <Input
          placeholder="Filter languages..."
          value={
            (table.getColumn("language")?.getFilterValue() as string) ?? ""
          }
          // deno-lint-ignore no-explicit-any
          onChange={(event: any) =>
            table.getColumn("language")?.setFilterValue(event.target.value)
          }
          className="max-w-sm text-black"
        />

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
                    onCheckedChange={(value: boolean) =>
                      column.toggleVisibility(value)
                    }
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
