"use client";

import { api } from "@/trpc/react";
import React from "react";
import { DataTable, columns } from "@/app/DataTable";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function Home() {
  const library = api.audible.getLibrary.useQuery(undefined, {
    refetchInterval: 1000,
  });

  const { isFetching: isRefreshingAudibleLibrary, ...refreshApi } =
    api.audible.doLibraryRefresh.useQuery(undefined, {
      enabled: false,
    });

  function doLibraryRefresh() {
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
      {library.isSuccess && (
        <>
          <div className="flex flex-row gap-4">
            <Button
              onClick={doLibraryRefresh}
              disabled={isRefreshingAudibleLibrary}
            >
              {isRefreshingAudibleLibrary ? (
                <LoadingSpinner />
              ) : (
                "Refresh Library"
              )}
            </Button>
            <Button onClick={downloadAll} disabled={isDownloadingAllBooks}>
              {isDownloadingAllBooks ? (
                <LoadingSpinner />
              ) : (
                "Download All Books"
              )}
            </Button>
          </div>
          <DataTable data={library.data} columns={columns} />
        </>
      )}
    </div>
  );
}
