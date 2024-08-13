import { downloadItem, getLibrary } from "@/server/utils/audible-cli";
import { book } from "@/server/db/schema";
import { db } from "@/server/db";

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
}
