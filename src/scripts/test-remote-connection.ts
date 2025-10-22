/**
 * Test script for remote D1 database connection
 *
 * This script demonstrates how to connect to your D1 database
 * using API key authentication.
 *
 * Usage:
 *   npm run db:test
 *
 * Make sure you have these environment variables set in .env:
 *   - CLOUDFLARE_API_TOKEN
 *   - CLOUDFLARE_ACCOUNT_ID
 *   - CLOUDFLARE_DATABASE_ID
 *
 * Note: If you encounter SSL certificate errors, this is usually due to
 * Node.js version or corporate proxy issues. The workaround is already
 * included below.
 */

import { resolve } from "node:path";
import { config } from "dotenv";
import { createRemoteDB } from "../db/remote";

// Workaround for SSL certificate validation issues in Node.js
// Only used for this test script - not needed in production Workers
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load environment variables from project root
config({ path: resolve(process.cwd(), ".env") });

async function testConnection() {
  console.log("🔄 Testing remote D1 database connection...\n");

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

  // Check for placeholder values
  if (accountId === "your_account_id_here" || apiToken.includes("your_")) {
    console.error("❌ You're still using placeholder values!");
    console.error("\n📝 To get your Cloudflare Account ID:");
    console.error("   1. Go to https://dash.cloudflare.com");
    console.error("   2. Click on any service (Workers & Pages, etc.)");
    console.error("   3. Copy the Account ID from the URL or right sidebar");
    console.error("\n📝 To create an API Token:");
    console.error("   1. Go to https://dash.cloudflare.com/profile/api-tokens");
    console.error("   2. Click 'Create Token' → 'Create Custom Token'");
    console.error("   3. Add permission: Account → D1 → Edit");
    console.error("   4. Create and copy the token");
    console.error("\n   Then update your .env file in Toast_App_Backend-1/");
    process.exit(1);
  }

  console.log("✅ Environment variables loaded:");
  console.log(`   Account ID: ${accountId}`);
  console.log(`   Database ID: ${databaseId}`);
  console.log(`   API Token: ${apiToken.substring(0, 10)}...\n`);

  try {
    // Create remote database connection
    const db = createRemoteDB(apiToken, accountId, databaseId);

    // Test query: Get all tables
    console.log("📊 Fetching database tables...");
    const tables = await db.query<{ name: string }>(
      "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name"
    );

    console.log("\n✅ Connected successfully!\n");
    console.log("📋 Tables in your database:");
    if (tables.length === 0) {
      console.log("   (No tables found - database might be empty)");
    } else {
      for (const table of tables) {
        console.log(`   - ${table.name}`);
      }
    }

    // If users table exists, show count
    if (tables.some((t) => t.name === "users")) {
      console.log("\n👥 Checking users table...");
      const userCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM users");
      console.log(`   Total users: ${userCount[0]?.count || 0}`);
    }

    // If toasts table exists, show count
    if (tables.some((t) => t.name === "toasts")) {
      console.log("\n🍞 Checking toasts table...");
      const toastCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM toasts");
      console.log(`   Total toasts: ${toastCount[0]?.count || 0}`);
    }

    console.log("\n✨ Connection test completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Connection test failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

// Run the test
testConnection();
