import {
  createTRPCReact,
  type inferReactQueryProcedureOptions,
} from "@trpc/react-query";
import type { inferRouterInputs, inferRouterOutputs } from "@trpc/server";
import type { AppRouter } from "../../../server/main.ts";
import { createTRPCClient, httpBatchLink } from "@trpc/client";

// infer the types for your router
export type ReactQueryOptions = inferReactQueryProcedureOptions<AppRouter>;
export type RouterInputs = inferRouterInputs<AppRouter>;
export type RouterOutputs = inferRouterOutputs<AppRouter>;

export const trpc = createTRPCReact<AppRouter>();

export const trpcVanillaClient = createTRPCClient<AppRouter>({
  links: [
    httpBatchLink({
      url:
        (import.meta as any).env.MODE === "development"
          ? "http://localhost:8000/trpc"
          : "/trpc",
    }),
  ],
});
