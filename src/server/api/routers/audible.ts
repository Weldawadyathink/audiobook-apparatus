import { createTRPCRouter, publicProcedure } from "@/server/api/trpc";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";
import {
  downloadAll,
  downloadAudibleBook,
  refreshLibrary,
} from "@/server/utils/audible-book-manager";
import { z } from "zod";

export interface LibraryItem {
  id: number;
  asin: string | null;
  source: string | null;
  status: string | null;
  title: string | null;
  imageUrl: string | null;
  downloadPercentage: number | null;
  downloadSpeed: string | null;
  isDownloadable: boolean | null;
  language: string | null;
  runtimeLengthMinutes: string | null;
  author: string | null;
  narrator: string | null;
}

export const audibleRouter = createTRPCRouter({
  getLibrary: publicProcedure.query(async (): Promise<LibraryItem[]> => {
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
        isDownloadable: book.isDownloadable,
        language: book.language,
        runtimeLengthMinutes: book.runtimeLengthMinutes,
        author: book.author,
        narrator: book.narrator,
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
  downloadAllBooks: publicProcedure.query(async () => {
    await downloadAll();
    return "Downloads complete";
  }),
});
