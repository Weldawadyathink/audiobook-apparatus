import { getLibrary } from "@/server/utils/audible-cli";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";
import { and, eq, isNotNull, isNull } from "drizzle-orm";
import { fetcher } from "itty-fetcher";

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

  for (const item of results) {
    api
      .get(item.asin!)
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
          .where(eq(book.asin, item.asin!));
        return console.log(`Updated data for ${item.asin}`);
      })
      .catch((err) =>
        console.error(`Error fetching ${item.asin} from audible api: ${err}`),
      );
  }
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
