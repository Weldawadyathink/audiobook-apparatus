import { type Config } from "drizzle-kit";

export default {
  schema: "./db/schema.ts",
  dialect: "sqlite",
  dbCredentials: {
    url: Deno.env.get("AA_DATABASE_URL") || "file:./db.sqlite",
  },
} satisfies Config;
