import { Hono } from "hono";
import { serveStatic } from "hono/deno";
import { trpcServer } from "@hono/trpc-server";
import { cors } from "hono/cors";
import { publicProcedure, router } from "./trpc.ts";
import z from "zod";
import { db } from "./db/index.ts";
import { migrations } from "./db/schema.ts";

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

const appliedMigrations: string[] = await db
  .select({
    name: migrations.name,
    appliedAt: migrations.appliedAt,
  })
  .from(migrations)
  .then((result) => result.map((item) => item.name!))
  .catch(() => []);
console.log(appliedMigrations);

export default app;
