"use client";

import { api } from "@/trpc/react";
import React from "react";
import { DataTable, columns } from "@/app/DataTable";

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
