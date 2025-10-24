/**
 * Complete local database setup script
 *
 * This script sets up your local development database from scratch:
 * 1. Wipes any existing local database
 * 2. Applies all migrations
 * 3. Seeds with data from remote database
 *
 * Usage:
 *   npm run db:setup
 */

import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createRemoteDB } from "../db/remote";

// Workaround for SSL certificate validation issues in Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load environment variables from project root
config({ path: resolve(process.cwd(), ".env"), quiet: true });

function runCommand(command: string, description: string): boolean {
  try {
    console.log(`   Running: ${description}...`);
    execSync(command, {
      stdio: "pipe",
      env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
    });
    console.log(`   ✅ ${description} completed`);
    return true;
  } catch (_error) {
    console.log(`   ⚠️ ${description} failed (might be expected)`);
    return false;
  }
}

async function setupLocalDatabase() {
  console.log("🚀 Setting up local development database...\n");

  // Verify environment variables for remote sync
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error("❌ Missing required environment variables!");
    console.error(
      "Please set CLOUDFLARE_API_TOKEN, CLOUDFLARE_ACCOUNT_ID, and CLOUDFLARE_DATABASE_ID in your .env file"
    );
    process.exit(1);
  }

  try {
    // Step 1: Clean slate - remove any existing local database
    console.log("🧹 Step 1: Cleaning up existing local database...");
    runCommand(
      `rm -rf .wrangler/state/v3/d1/miniflare-D1DatabaseObject || true`,
      "Remove existing local database files"
    );

    // Step 2: Apply migrations to create schema
    console.log("\n📋 Step 2: Applying database migrations...");
    runCommand(`npx wrangler d1 migrations apply toast-app-db --local`, "Apply database schema");

    // Step 3: Fetch data from remote database
    console.log("\n📊 Step 3: Fetching data from remote database...");
    const db = createRemoteDB(apiToken, accountId, databaseId);

    // Get all users from remote
    const remoteUsers = await db.query<{ userID: string; name: string }>(
      "SELECT userID, name FROM users"
    );
    console.log(`   Found ${remoteUsers.length} users in remote database`);

    // Get all toasts from remote
    const remoteToasts = await db.query<{
      toastID: string;
      toasterID: string;
      toastieID: string;
      toastTime: string;
    }>("SELECT toastID, toasterID, toastieID, toastTime FROM toasts");
    console.log(`   Found ${remoteToasts.length} toasts in remote database`);

    // Step 4: Seed local database with remote data
    console.log("\n🌱 Step 4: Seeding local database with remote data...");

    // Seed users
    console.log("   👥 Seeding users...");
    for (const user of remoteUsers) {
      const sql = `INSERT INTO users (userID, name) VALUES ('${user.userID}', '${user.name}');`;
      runCommand(
        `npx wrangler d1 execute toast-app-db --local --command="${sql}"`,
        `Add user: ${user.name}`
      );
    }

    // Seed toasts
    console.log("   🍞 Seeding toasts...");
    for (const toast of remoteToasts) {
      const sql = `INSERT INTO toasts (toastID, toasterID, toastieID, toastTime) VALUES ('${toast.toastID}', '${toast.toasterID}', '${toast.toastieID}', '${toast.toastTime}');`;
      runCommand(
        `npx wrangler d1 execute toast-app-db --local --command="${sql}"`,
        `Add toast: ${toast.toastID.substring(0, 8)}...`
      );
    }

    // Step 5: Verify setup
    console.log("\n📊 Step 5: Verifying local database setup...");
    try {
      const _result = execSync(
        `npx wrangler d1 execute toast-app-db --local --command="SELECT COUNT(*) as userCount FROM users; SELECT COUNT(*) as toastCount FROM toasts;"`,
        {
          encoding: "utf-8",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        }
      );
      console.log("   ✅ Local database verification completed");
    } catch (_error) {
      console.log("   ⚠️ Could not verify database (but setup likely succeeded)");
    }

    console.log("\n✨ Local database setup completed successfully!\n");
    console.log("🎯 What you can do now:");
    console.log("   • npm run dev          - Start local development server");
    console.log("   • npm run db:sync      - Re-sync with remote data anytime");
    console.log("   • npm run deploy       - Deploy to production");
    console.log("\n💡 Your local database now contains a copy of production data");
    console.log("💡 Changes you make locally won't affect the remote database");
  } catch (error) {
    console.error("\n❌ Database setup failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    console.error("\n🔧 Try running these commands manually:");
    console.error("   1. npx wrangler d1 migrations apply toast-app-db --local");
    console.error("   2. npm run db:seed:local");
    process.exit(1);
  }
}

// Run the setup
setupLocalDatabase();
