import { router } from "../trpc.ts";

import { bookRouter } from "./book.ts";

export const appRouter = router({
  book: bookRouter,
});

export type AppRouter = typeof appRouter;
