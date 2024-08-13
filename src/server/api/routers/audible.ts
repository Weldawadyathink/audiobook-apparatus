import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";

export const audibleRouter = createTRPCRouter({
  getLibrary: publicProcedure.query(async () => {
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
  doLibraryRefresh: publicProcedure.query(() => {
    console.log("--------- Running library refresh ---------");
    return "--------- Running library refresh ---------";
  }),
  // processItem: publicProcedure.input(z.string()).query(({ input }) => {
  //   downloadItem(input, (p) => console.log(p))
  //     .then(() => console.log("Download complete"))
  //     .catch((e) => console.error(e));
  //   return "Download started";
  // }),
});
