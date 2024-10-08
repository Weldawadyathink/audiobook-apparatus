import {
  convertAax,
  convertAaxc,
  downloadItem,
  getLibrary,
} from "./audible-cli.ts";
import { book } from "../db/schema.ts";
import { db } from "../db/database.ts";
import { and, eq, isNotNull, isNull, or } from "drizzle-orm";
import { fetcher } from "itty-fetcher";
import fs from "node:fs";
import * as Path from "node:path";
import pAll from "p-all";
import { getConfig } from "../config.ts";
import { z } from "zod";

async function reindexAudibleData() {
  const api = fetcher({
    base: "https://api.audible.com/1.0/catalog/products/",
    transformRequest: (req) => {
      const url = new URL(req.url);
      url.searchParams.set("response_groups", "media");
      url.searchParams.set("image_sizes", "500");
      req.url = url.toString();
      return req;
    },
  });

  const results = await db
    .select({ asin: book.asin })
    .from(book)
    .where(
      and(
        eq(book.source, "Audible"),
        isNotNull(book.asin),
        or(
          isNull(book.title),
          isNull(book.imageUrl),
          isNull(book.author),
          isNull(book.narrator),
        ),
      ),
    );

  console.log(`Updating audible data for ${results.length} books`);

  const audibleProductResponse = z.object({
    asin: z.coerce.string().catch(""),
    authors: z.array(
      z.object({
        name: z.coerce.string().catch(""),
      }),
    ),
    narrators: z.array(
      z.object({
        name: z.coerce.string().catch(""),
      }),
    ),
    publication_name: z.coerce.string().catch(""),
    publisher_name: z.coerce.string().catch(""),
    runtime_length_min: z.coerce.number().int().catch(0),
    product_images: z.object({
      "500": z.coerce.string().url(),
    }),
    title: z.coerce.string().catch(""),
    subtitle: z.coerce.string().catch(""),
    language: z.coerce.string().catch(""),
    is_listenable: z.coerce.boolean(),
  });

  interface AudibleApiResponse {
    product: z.infer<typeof audibleProductResponse>;
  }

  async function updateBook(asin: string, retryNumber = 0) {
    const maxRetries = 5;
    await api
      .get(asin)
      .then(async (response) => {
        const data = audibleProductResponse.parse(
          (response as AudibleApiResponse).product,
        );
        await db
          .update(book)
          .set({
            title: data.title,
            imageUrl: data.product_images["500"],
            language: data.language,
            isDownloadable: data.is_listenable,
            narrator: data.narrators[0]?.name ?? null,
            author: data.authors[0]?.name,
          })
          .where(eq(book.asin, asin));
        return console.log(`Updated data for ${asin}`);
      })
      .catch((error) => {
        if (retryNumber < maxRetries) {
          console.log(`Issue with fetching ${asin}, retrying...`);
          return updateBook(asin, retryNumber + 1);
        } else {
          console.log(`Error fetching ${asin} from audible api: ${error}`);
          throw error;
        }
      });
  }

  await Promise.allSettled(
    results.map((item) => {
      return updateBook(item.asin!);
    }),
  );
}

export async function refreshLibrary() {
  const library = await getLibrary();

  const values = library.map(
    (item): { asin: string; source: "Audible"; status: "Not Downloaded" } => {
      return {
        asin: item,
        source: "Audible",
        status: "Not Downloaded",
      };
    },
  );

  await db.insert(book).values(values).onConflictDoNothing();
  await reindexAudibleData();
}

export async function downloadAudibleBook(asin: string) {
  const [bookToProcess] = await db
    .select({
      id: book.id,
      asin: book.asin,
      title: book.title,
      status: book.status,
      source: book.source,
    })
    .from(book)
    .where(eq(book.asin, asin));

  if (bookToProcess === undefined) {
    return "ASIN not found";
  }

  if (bookToProcess.source !== "Audible") {
    return "Book is not from audible";
  }

  if (bookToProcess.title === null) {
    return "Title not found in database";
  }

  if (bookToProcess.status !== "Not Downloaded") {
    return `Status is ${bookToProcess.status}, must be "Not Downloaded"`;
  }

  // Preconditions complete, actual processing begins

  await db
    .update(book)
    .set({ status: "Downloading" })
    .where(eq(book.asin, asin));

  const maxRetries = 5;

  interface ExtendedDownloadType
    extends Awaited<ReturnType<typeof downloadItem>> {
    tempFolder: string;
  }

  async function doDownload(
    asin: string,
    progressFunction?: (data: {
      percent: number;
      downloadSize: string | undefined;
      totalSize: string | undefined;
      speed: string | undefined;
    }) => Promise<unknown>,
    retryNumber = 0,
  ): Promise<ExtendedDownloadType> {
    const tempFolder = `${Deno.cwd()}/tmp/${crypto.randomUUID()}`;
    fs.mkdirSync(tempFolder, { recursive: true });
    try {
      const result = await downloadItem(asin, tempFolder, progressFunction);
      return {
        ...result,
        tempFolder: tempFolder,
      };
    } catch (error) {
      fs.rmSync(tempFolder, { recursive: true, force: true });
      const message = error instanceof Error ? error.message : "Unknown error";
      if (message === "Download failed. Safe to retry.") {
        if (retryNumber < maxRetries) {
          return doDownload(asin, progressFunction, retryNumber + 1);
        } else {
          throw new Error(`Download failed more than ${maxRetries} times.`);
        }
      } else {
        throw error;
      }
    }
  }

  const { tempFolder, ...downloadResult } = await doDownload(asin, (data) => {
    return db
      .update(book)
      .set({
        downloadPercentage: data.percent,
        downloadSpeed: data.speed,
      })
      .where(eq(book.asin, asin));
  }).catch(async (error) => {
    await db.update(book).set({ status: "Failed" }).where(eq(book.asin, asin));
    throw error;
  });

  await db
    .update(book)
    .set({ status: "Processing" })
    .where(eq(book.asin, asin));

  const outputDir = `${Deno.cwd()}/output/`;
  const { name: newFilename } = Path.parse(downloadResult.filename);
  const outputFilepath = `${outputDir}/${newFilename}.m4b`;

  if (!fs.existsSync(Path.parse(outputFilepath).dir)) {
    fs.mkdirSync(Path.parse(outputFilepath).dir, { recursive: true });
  }

  if (downloadResult.voucherFilename) {
    console.log(`Converting ${asin} aaxc file`);
    await convertAaxc(
      downloadResult.filename,
      downloadResult.voucherFilename,
      outputFilepath,
    );
  } else {
    console.log(`Converting ${asin} aax file`);
    await convertAax(
      downloadResult.filename,
      outputFilepath,
      getConfig().audibleActivationBytes.value,
    );
  }

  await db.update(book).set({ status: "Complete" }).where(eq(book.asin, asin));

  fs.rmSync(tempFolder, { recursive: true, force: true });

  return "Audible download and conversion complete";
}

export async function downloadAll() {
  const booksToDownload = await db
    .select({ asin: book.asin })
    .from(book)
    .where(
      and(
        isNotNull(book.asin),
        eq(book.source, "Audible"),
        eq(book.status, "Not Downloaded"),
        isNotNull(book.title),
      ),
    );

  if (booksToDownload.length === 0) {
    return "No books to download";
  }

  console.log(`Starting bulk download of ${booksToDownload.length}`);

  const downloadFunctions = booksToDownload.map((book) => {
    return () => {
      console.log(`Starting download for ${book.asin}`);
      return downloadAudibleBook(book.asin!);
    };
  });

  await pAll(downloadFunctions, {
    concurrency: getConfig().maxConcurrentDownloads.value,
    stopOnError: false,
  }).catch((error) => {
    if (error instanceof AggregateError) {
      console.log("Some items failed to download");
    } else {
      throw error;
    }
  });

  console.log("Bulk download complete");
  return "Bulk download complete";
}
