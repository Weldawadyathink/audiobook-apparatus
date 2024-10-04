import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { trpcServer } from "@hono/trpc-server";
import { appRouter } from "./routers/_app.ts";
import { cors } from "hono/cors";

const app = new Hono();

app.use(cors());

app.use(
  "/trpc/*",
  trpcServer({
    endpoint: "/trpc",
    router: appRouter,
  }),
);

app.use(
  "*",
  serveStatic({
    root: "./dist/",
  }),
);

export default app;
