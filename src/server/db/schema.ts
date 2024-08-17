import { int, text, sqliteTable, integer } from "drizzle-orm/sqlite-core";

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
