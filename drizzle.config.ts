import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./migrations",
  dialect: "sqlite",
  // For local development, we'll use wrangler dev which handles the connection
  // For production, we can add the d1-http driver configuration
});
