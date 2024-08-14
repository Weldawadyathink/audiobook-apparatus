import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";
import {
  downloadAll,
  downloadAudibleBook,
  refreshLibrary,
} from "@/server/utils/audible-book-manager";
import { z } from "zod";

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
        downloadPercentage: book.downloadPercentage,
        downloadSpeed: book.downloadSpeed,
      })
      .from(book);
  }),
  doLibraryRefresh: publicProcedure.query(async () => {
    console.log("--------- Running library refresh ---------");
    await refreshLibrary();
    console.log("--------- Library refresh complete ---------");
    return "Refresh complete";
  }),
  downloadBook: publicProcedure.input(z.string()).query(async ({ input }) => {
    void downloadAudibleBook(input);
    return "Download started";
  }),
  downloadAllBooks: publicProcedure
    .input(z.number().int().min(1).max(10))
    .query(async ({ input }) => {
      await downloadAll(input);
      return "Downloads complete";
    }),
});
