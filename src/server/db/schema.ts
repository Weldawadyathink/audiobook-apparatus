import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const book = sqliteTable("book", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  asin: text("asin"),
  status: text("status", {
    enum: ["Not Downloaded", "Downloading", "Complete"],
  }).default("Not Downloaded"),
  filename: text("filename"),
  source: text("source", { enum: ["Audible", "External"] }),
});
