import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { httpBatchLink } from "@trpc/client";
import { useState } from "react";
import { trpc } from "./lib/trpc.ts";

function App() {
  const [queryClient] = useState(() => new QueryClient());
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url:
            // deno-lint-ignore no-explicit-any
            (import.meta as any).env.MODE === "development"
              ? "http://localhost:8000/trpc"
              : "/trpc",
        }),
      ],
    }),
  );

  const [count, setCount] = useState(0);

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <QueryClientProvider client={queryClient}>
        <img src="/vite-deno.svg" alt="Vite with Deno" />
        <div>
          <a href="https://vitejs.dev" target="_blank">
            <img src="/vite.svg" className="logo" alt="Vite logo" />
          </a>
          <a href="https://reactjs.org" target="_blank">
            <img
              src="https://react.dev/images/home/conf2021/cover.svg"
              className="logo react"
              alt="React logo"
            />
          </a>
        </div>
        <h1>Vite + React</h1>
        <div className="card">
          <button onClick={() => setCount((count: number) => count + 1)}>
            count is {count}
          </button>
          <p>
            Edit <code>src/App.tsx</code> and save to test HMR
          </p>
        </div>
        <p className="read-the-docs">
          Click on the Vite and React logos to learn more
        </p>
      </QueryClientProvider>
    </trpc.Provider>
  );
}

export default App;
