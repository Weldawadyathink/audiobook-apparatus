import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";
import { refreshLibrary } from "@/server/utils/audible-book-manager";

export const audibleRouter = createTRPCRouter({
  getLibrary: publicProcedure.query(() => {
    return db
      .select({
        id: book.id,
        asin: book.asin,
        source: book.source,
        status: book.status,
        title: book.title,
        imageUrl: book.imageUrl,
      })
      .from(book);
  }),
  doLibraryRefresh: publicProcedure.query(async () => {
    console.log("--------- Running library refresh ---------");
    await refreshLibrary();
    console.log("--------- Library refresh complete ---------");
    return "Refresh complete";
  }),
});
