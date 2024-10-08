import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { publicProcedure, router } from "./trpc.ts";
import z from "zod";

const appRouter = router({
  greeting: publicProcedure.query(() => "hello tRPC v10!"),
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
    return `Hello, ${input ?? "World"}!`;
  }),
});

export type AppRouter = typeof appRouter;

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
