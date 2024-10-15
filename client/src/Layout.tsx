import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./lib/trpc.ts";
import { BookList } from "./BookList.tsx";

function Layout() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url:
            // deno-lint-ignore no-explicit-any
            (import.meta as any).env.MODE === "development"
              ? "http://localhost:3000/trpc"
              : "/trpc",
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <BookList />
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default Layout;
