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

type LibraryItem = inferRouterOutputs<AppRouter>["audible"]["getLibrary"][0];

function LibraryRow(params: { book: LibraryItem }) {
  return (
    <TableRow>
      <TableCell>{params.book.asin}</TableCell>
      <TableCell>{params.book.title}</TableCell>
      <TableCell>{params.book.status}</TableCell>
    </TableRow>
  );
}

export default function Home() {
  const library = api.audible.getLibrary.useQuery();

  const refreshApi = api.audible.doLibraryRefresh.useQuery(undefined, {
    enabled: false,
  });

  function doRefresh() {
    void refreshApi.refetch().then(() => library.refetch());
  }

  return (
    <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16">
      <Button disabled={refreshApi.isFetching} onClick={doRefresh}>
        {refreshApi.isFetching ? <LoadingSpinner /> : "Refresh Library"}
      </Button>
      <span>{refreshApi.isFetching}</span>
      {library.isLoading && <span>Loading</span>}
      {library.isSuccess && (
        <Table>
          <TableCaption>Audible Library</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>ASIN</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {library.data.map((item) => (
              <LibraryRow key={item.id} book={item}></LibraryRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
