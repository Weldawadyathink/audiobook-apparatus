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

type LibraryItem = inferRouterOutputs<AppRouter>["audible"]["getLibrary"][0];

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
    api.audible.downloadAllBooks.useQuery(5, {
      enabled: false,
    });

  function downloadAll() {
    void downloadAllQuery().then(() => void library.refetch());
  }

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
