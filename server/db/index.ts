import { createClient, type Client } from "@libsql/client/sqlite3";
import { drizzle } from "drizzle-orm/libsql";
import { sql } from "drizzle-orm";
import fs from "node:fs";
import * as schema from "./schema.ts";
import "jsr:@std/dotenv/load";

const globalForDb = globalThis as unknown as {
  client: Client | undefined;
  db: ReturnType<typeof drizzle> | undefined;
};

if (!globalForDb.client || !globalForDb.db) {
  // Setup client connection
  globalForDb.client = createClient({
    url: Deno.env.get("AA_DATABASE_URL") || "file:./db.sqlite",
  });
  globalForDb.db = drizzle(globalForDb.client, { schema })!;

  // Apply migrations
  const migrationsFolder = "./drizzle";

  const appliedMigrations: string[] = await globalForDb.db
    .select({
      name: schema.migrations.name,
      appliedAt: schema.migrations.appliedAt,
    })
    .from(schema.migrations)
    .then((result) => result.map((item) => item.name!))
    .catch(() => []);

  const availableMigrations = fs
    .readdirSync(migrationsFolder)
    .filter((file) => file.endsWith("sql"));

  const migrationsToApply = availableMigrations
    .filter((m) => !appliedMigrations.includes(m))
    .sort();

  if (migrationsToApply.length > 0) {
    for (const migrationName of migrationsToApply) {
      console.log(`Applying migration ${migrationName}`);
      const squeal = fs
        .readFileSync(`${migrationsFolder}/${migrationName}`)
        .toString();
      await globalForDb.db.run(sql.raw(squeal));
      await globalForDb.db
        .insert(schema.migrations)
        .values({ name: migrationName });
    }
  } else {
    console.log("No migrations to apply.");
  }
}

export const client: Client = globalForDb.client;
export const db: ReturnType<typeof drizzle> = globalForDb.db;
