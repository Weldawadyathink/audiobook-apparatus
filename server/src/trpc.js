import { initTRPC } from "@trpc/server";
const t = initTRPC.create();
export const createRouter = t.router;
export const publicProcedure = t.procedure;
