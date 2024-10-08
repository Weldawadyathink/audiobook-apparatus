import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { appRouter } from "./routers/_app.ts";

export type AppRouter = typeof appRouter;

const app = new Hono();

app.use(cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter as any, // Hono tRPC adapter doesn't like tRPC v11
  }),
);

app.use(
  "*",
  serveStatic({
    root: "./dist/",
  }),
);

export default app;
