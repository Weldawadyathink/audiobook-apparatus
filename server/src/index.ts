import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { appRouter } from "./routers/_app.ts";
import { fetchRequestHandler } from "@trpc/server/adapters/fetch";

export type AppRouter = typeof appRouter;

const app = new Hono();

app.use(cors());

app.use("/trpc/*", (c) => {
  return fetchRequestHandler({
    endpoint: "/trpc",
    req: c.req.raw,
    router: appRouter,
  }).then((res) => c.body(res.body, res));
});

app.use(
  "*",
  serveStatic({
    root: "./dist/",
  }),
);

export default app;
