import { createRouter, publicProcedure } from "../trpc.ts";
import { audibleRouter } from "./audible.ts";
import { configRouter } from "./config.ts";
import { z } from "zod";
export const appRouter = createRouter({
    audible: audibleRouter,
    config: configRouter,
    hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
        return `hello ${input ?? "world"}`;
    }),
});
