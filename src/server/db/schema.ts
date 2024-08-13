import { int, text, sqliteTable } from "drizzle-orm/sqlite-core";

export const book = sqliteTable("book", {
  id: int("id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  asin: text("asin"),
  status: text("status"),
  filename: text("filename"),
});
