import { db } from "@/server/db";
import { migrations } from "@/server/db/schema";
import fs from "node:fs";
import { sql } from "drizzle-orm";
import { getConfig, setConfig } from "@/config";

async function applyMigrations() {
  const migrationsFolder = "./drizzle";

  const appliedMigrations: string[] = await db
    .select({ name: migrations.name, appliedAt: migrations.appliedAt })
    .from(migrations)
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
      await db.run(sql.raw(squeal));
      await db.insert(migrations).values({ name: migrationName });
    }
  } else {
    console.log("No migrations to apply.");
  }
}

await applyMigrations();

setConfig(getConfig());
