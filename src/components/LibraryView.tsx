"use client";

import { api } from "@/trpc/react";

export function LibraryView() {
  const library = api.audible.getLibrary.useQuery();
  return (
    <>
      {library.isLoading && <span>Loading</span>}
      {library.isSuccess && (
        <div className="flex flex-col items-center gap-2">
          {library.data.map((item) => (
            <p key={item.id}>
              {item.asin} {item.source} {item.status} {item.title}
            </p>
          ))}
        </div>
      )}
    </>
  );
}
