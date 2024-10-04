import { router, publicProcedure } from "../trpc.ts";
import { z } from "zod";

export const bookRouter = router({
  hello: publicProcedure.input(z.string().nullish()).query(({ input }) => {
    return `Hello, ${input ?? "World"}!`;
  }),
  test: publicProcedure.query(() => "Hi there"),
});
