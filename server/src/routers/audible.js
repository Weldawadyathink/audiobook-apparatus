import { createRouter, publicProcedure } from "../trpc.ts";
import { book } from "../db/schema.ts";
import { db } from "../db/database.ts";
import { downloadAll, downloadAudibleBook, refreshLibrary, } from "../utils/audible-book-manager.ts";
import { z } from "zod";
export const audibleRouter = createRouter({
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
    downloadBook: publicProcedure.input(z.string()).query(({ input }) => {
        void downloadAudibleBook(input);
        console.log(`Starting download for ${input}`);
        return "Download started";
    }),
    downloadAllBooks: publicProcedure.query(async () => {
        await downloadAll();
        return "Downloads complete";
    }),
});
