import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { refreshLibrary } from "@/server/utils/audible-book-manager";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";

export const audibleRouter = createTRPCRouter({
  getLibrary: publicProcedure.query(async () => {
    await refreshLibrary();
    return db
      .select({
        id: book.id,
        asin: book.asin,
        source: book.source,
        status: book.status,
      })
      .from(book);
  }),
  // processItem: publicProcedure.input(z.string()).query(({ input }) => {
  //   downloadItem(input, (p) => console.log(p))
  //     .then(() => console.log("Download complete"))
  //     .catch((e) => console.error(e));
  //   return "Download started";
  // }),
});
