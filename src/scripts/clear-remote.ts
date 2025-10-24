/**
 * Clear script for remote D1 database
 *
 * This script clears all data from your D1 database
 * using API key authentication.
 *
 * Usage:
 *   npm run db:clear
 *
 * Make sure you have these environment variables set in .env:
 *   - CLOUDFLARE_API_TOKEN
 *   - CLOUDFLARE_ACCOUNT_ID
 *   - CLOUDFLARE_DATABASE_ID
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import { createRemoteDB } from "../db/remote";

// Workaround for SSL certificate validation issues in Node.js
// Only used for this script - not needed in production Workers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load environment variables from project root
config({ path: resolve(process.cwd(), ".env"), quiet: true });

async function clearDatabase() {
  console.log("🧹 Clearing remote D1 database...\n");

  // Safety confirmation for production database
  console.log("⚠️  WARNING: This will delete ALL data from the PRODUCTION database!");
  console.log("⚠️  This action cannot be undone!\n");

  // Simple confirmation check
  const confirmText = process.argv[2];
  if (confirmText !== "--confirm") {
    console.error("❌ Safety check failed!");
    console.error("To proceed, run: npm run db:clear -- --confirm");
    process.exit(1);
  }

  // Verify environment variables
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error("❌ Missing required environment variables!");
    console.error("Please set the following in your .env file:");
    if (!apiToken) console.error("  - CLOUDFLARE_API_TOKEN");
    if (!accountId) console.error("  - CLOUDFLARE_ACCOUNT_ID");
    if (!databaseId) console.error("  - CLOUDFLARE_DATABASE_ID");
    process.exit(1);
  }

  console.log("✅ Environment variables loaded:");
  console.log(`   Account ID: ${accountId}`);
  console.log(`   Database ID: ${databaseId}`);
  console.log(`   API Token: ${apiToken.substring(0, 10)}...\n`);

  try {
    // Create remote database connection
    const db = createRemoteDB(apiToken, accountId, databaseId);

    console.log("📊 Starting database clearing...\n");

    // Get current counts
    console.log("📋 Current database state:");
    try {
      const toastCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM toasts");
      console.log(`   🍞 Toasts: ${toastCount[0]?.count || 0}`);
    } catch (_error) {
      console.log("   🍞 Toasts table doesn't exist or is empty");
    }

    try {
      const userCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM users");
      console.log(`   👥 Users: ${userCount[0]?.count || 0}`);
    } catch (_error) {
      console.log("   👥 Users table doesn't exist or is empty");
    }

    console.log("\n🗑️ Clearing data...");

    // Clear toasts first (foreign key constraints)
    try {
      await db.query("DELETE FROM toasts");
      console.log("   ✅ Cleared toasts table");
    } catch (_error) {
      console.log("   ⚠️ Could not clear toasts table (might not exist)");
    }

    // Clear users
    try {
      await db.query("DELETE FROM users");
      console.log("   ✅ Cleared users table");
    } catch (_error) {
      console.log("   ⚠️ Could not clear users table (might not exist)");
    }

    // Verify clearing
    console.log("\n📊 Verification:");
    try {
      const toastCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM toasts");
      console.log(`   🍞 Toasts remaining: ${toastCount[0]?.count || 0}`);
    } catch (_error) {
      console.log("   🍞 Toasts table doesn't exist");
    }

    try {
      const userCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM users");
      console.log(`   👥 Users remaining: ${userCount[0]?.count || 0}`);
    } catch (_error) {
      console.log("   👥 Users table doesn't exist");
    }

    console.log("\n✨ Database clearing completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Clearing failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

// Run the clearing
clearDatabase();
