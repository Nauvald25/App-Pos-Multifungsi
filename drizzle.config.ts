import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./drizzle",
  dialect: "sqlite",
  driver: "d1-http", // D1 = SQLite; generate SQL kompatibel D1
  verbose: true,
  strict: true,
});
