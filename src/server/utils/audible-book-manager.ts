import { downloadItem, getLibrary } from "@/server/utils/audible-cli";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { fetcher } from "itty-fetcher";
import fs from "node:fs";

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
      and(eq(book.source, "Audible"), isNotNull(book.asin), isNull(book.title)),
    );

  console.log(`Updating audible data for ${results.length} books`);

  interface AudibleCatalogProductResponse {
    // Incomplete, but includes all parts used
    product: {
      asin: string;
      product_images: {
        "500": string;
      };
      title: string;
    };
  }

  async function updateBook(asin: string, retryNumber = 0) {
    const maxRetries = 5;
    await api
      .get(asin)
      .then(async (response) => {
        const data = response as AudibleCatalogProductResponse;
        const title = data.product.title;
        const imageUrl = data.product.product_images["500"];
        await db
          .update(book)
          .set({
            title: title,
            imageUrl: imageUrl,
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

  const foldername = `./tmp/${crypto.randomUUID()}`;
  fs.mkdirSync(foldername, { recursive: true });

  const downloadResult = await downloadItem(asin, foldername, async (data) => {
    return db
      .update(book)
      .set({
        downloadPercentage: data.percent,
        downloadSpeed: data.speed,
      })
      .where(eq(book.asin, asin));
  });

  await db
    .update(book)
    .set({ status: "Processing" })
    .where(eq(book.asin, asin));
}
