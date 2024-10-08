import { createRouter } from "../trpc.ts";
import { audibleRouter } from "./audible.ts";
import { configRouter } from "./config.ts";

export const appRouter = createRouter({
  audible: audibleRouter, // put procedures under "user" namespace
  config: configRouter, // put procedures under "post" namespace
});

// You can then access the merged route with
// http://localhost:3000/trpc/<NAMESPACE>.<PROCEDURE>

export type AppRouter = typeof appRouter;
