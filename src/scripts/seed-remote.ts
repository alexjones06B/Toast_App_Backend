/**
 * Seed script for remote D1 database
 *
 * This script seeds your D1 database with sample data
 * using API key authentication.
 *
 * Usage:
 *   npm run db:seed
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

async function seedDatabase() {
  console.log("🌱 Seeding remote D1 database...\n");

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

    console.log("📊 Starting database seeding...\n");

    // Seed sample users
    console.log("👥 Seeding users...");
    const users = [
      { userID: "550e8400-e29b-41d4-a716-446655440001", name: "Alice Johnson" },
      { userID: "550e8400-e29b-41d4-a716-446655440002", name: "Bob Smith" },
      { userID: "550e8400-e29b-41d4-a716-446655440003", name: "Charlie Brown" },
      { userID: "550e8400-e29b-41d4-a716-446655440004", name: "Diana Prince" },
    ];

    for (const user of users) {
      try {
        await db.query("INSERT OR IGNORE INTO users (userID, name) VALUES (?, ?)", [
          user.userID,
          user.name,
        ]);
        console.log(`   ✅ Added user: ${user.name}`);
      } catch (_error) {
        console.log(`   ⚠️ User ${user.name} might already exist or error occurred`);
      }
    }

    // Seed sample toasts
    console.log("\n🍞 Seeding toasts...");
    const toasts = [
      {
        toastID: "650e8400-e29b-41d4-a716-446655440001",
        toasterID: "550e8400-e29b-41d4-a716-446655440001", // Alice
        toastieID: "550e8400-e29b-41d4-a716-446655440002", // Bob
      },
      {
        toastID: "650e8400-e29b-41d4-a716-446655440002",
        toasterID: "550e8400-e29b-41d4-a716-446655440002", // Bob
        toastieID: "550e8400-e29b-41d4-a716-446655440003", // Charlie
      },
      {
        toastID: "650e8400-e29b-41d4-a716-446655440003",
        toasterID: "550e8400-e29b-41d4-a716-446655440003", // Charlie
        toastieID: "550e8400-e29b-41d4-a716-446655440001", // Alice
      },
      {
        toastID: "650e8400-e29b-41d4-a716-446655440004",
        toasterID: "550e8400-e29b-41d4-a716-446655440004", // Diana
        toastieID: "550e8400-e29b-41d4-a716-446655440001", // Alice
      },
    ];

    for (const toast of toasts) {
      try {
        await db.query(
          "INSERT OR IGNORE INTO toasts (toastID, toasterID, toastieID, toastTime) VALUES (?, ?, ?, datetime('now'))",
          [toast.toastID, toast.toasterID, toast.toastieID]
        );
        console.log(`   ✅ Added toast: ${toast.toastID.substring(0, 8)}...`);
      } catch (_error) {
        console.log(
          `   ⚠️ Toast ${toast.toastID.substring(0, 8)}... might already exist or error occurred`
        );
      }
    }

    // Verify seeding results
    console.log("\n📊 Verification:");

    const userCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM users");
    console.log(`   👥 Total users: ${userCount[0]?.count || 0}`);

    const toastCount = await db.query<{ count: number }>("SELECT COUNT(*) as count FROM toasts");
    console.log(`   🍞 Total toasts: ${toastCount[0]?.count || 0}`);

    // Show sample data
    console.log("\n📋 Sample users:");
    const sampleUsers = await db.query<{ userID: string; name: string }>(
      "SELECT userID, name FROM users LIMIT 3"
    );
    for (const user of sampleUsers) {
      console.log(`   - ${user.name} (${user.userID.substring(0, 8)}...)`);
    }

    console.log("\n📋 Sample toasts:");
    const sampleToasts = await db.query<{
      toastID: string;
      toasterName: string;
      toastieName: string;
      toastTime: string;
    }>(
      `SELECT t.toastID, u1.name as toasterName, u2.name as toastieName, t.toastTime 
       FROM toasts t 
       JOIN users u1 ON t.toasterID = u1.userID 
       JOIN users u2 ON t.toastieID = u2.userID 
       LIMIT 3`
    );
    for (const toast of sampleToasts) {
      console.log(`   - ${toast.toasterName} toasted ${toast.toastieName} at ${toast.toastTime}`);
    }

    console.log("\n✨ Database seeding completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Seeding failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

// Run the seeding
seedDatabase();
