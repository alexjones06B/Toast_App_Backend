/**
 * Apply migrations to remote D1 database using API
 *
 * This script reads migration files and applies them to the remote database
 * using the Cloudflare D1 HTTP API.
 *
 * Usage:
 *   npm run db:migrate:remote
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createRemoteDB } from "../db/remote";

// Workaround for SSL certificate validation issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load environment variables
config({ path: resolve(process.cwd(), ".env") });

async function applyMigrations() {
  console.log("🔄 Applying migrations to remote D1 database...\n");

  // Verify environment variables
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  try {
    const db = createRemoteDB(apiToken, accountId, databaseId);

    // Read the migration file
    const migrationPath = resolve(process.cwd(), "migrations/0000_mixed_steve_rogers.sql");
    const migrationSQL = readFileSync(migrationPath, "utf-8");

    console.log("📄 Migration file loaded");
    console.log("🔧 Applying migration...\n");

    // Split by statement breakpoint
    const statements = migrationSQL
      .split("--> statement-breakpoint")
      .map((s) => s.trim())
      .filter((s) => s.length > 0);

    console.log(`   Found ${statements.length} SQL statements\n`);

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];
      console.log(`   Executing statement ${i + 1}/${statements.length}...`);

      try {
        await db.query(statement);
        console.log(`   ✅ Statement ${i + 1} executed successfully`);
      } catch (error) {
        if (error instanceof Error && error.message.includes("already exists")) {
          console.log(`   ⚠️  Table already exists (skipping)`);
        } else {
          throw error;
        }
      }
    }

    console.log("\n✅ All migrations applied successfully!\n");

    // Verify tables were created
    console.log("📋 Verifying tables...");
    const tables = await db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE '_cf%' ORDER BY name"
    );

    if (tables.length > 0) {
      console.log("   Tables in database:");
      for (const table of tables) {
        console.log(`   ✓ ${table.name}`);
      }
    } else {
      console.log("   No user tables found");
    }

    console.log("\n✨ Migration complete!\n");
  } catch (error) {
    console.error("\n❌ Migration failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

applyMigrations();
