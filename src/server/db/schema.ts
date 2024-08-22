import { int, text, sqliteTable, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

export const migrations = sqliteTable("migrations", {
  name: text("name"),
  appliedAt: text("appliedAt").default(sql`CURRENT_TIMESTAMP`),
});

export const book = sqliteTable("book", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  asin: text("asin").unique(),
  status: text("status", {
    enum: ["Not Downloaded", "Downloading", "Processing", "Complete", "Failed"],
  }).default("Not Downloaded"),
  filename: text("filename"),
  source: text("source", { enum: ["Audible", "External"] }),
  title: text("title"),
  imageUrl: text("imageUrl"),
  downloadPercentage: integer("downloadPercentage"),
  downloadSpeed: text("downloadSpeed"),
  isDownloadable: integer("isDownloadable", { mode: "boolean" }),
  language: text("language"),
  runtimeLengthMinutes: text("runtimeLengthMinutes"),
  author: text("author"),
  narrator: text("narrator"),
});
