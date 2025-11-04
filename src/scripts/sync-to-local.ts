/**
 * Sync remote database data to local database
 *
 * This script fetches data from the remote D1 database and syncs it
 * to your local development database.
 *
 * Usage:
 *   npm run db:sync
 */

import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { config } from "dotenv";
import { createRemoteDB } from "../db/remote";

// Workaround for SSL certificate validation issues in Node.js
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Load environment variables from project root
config({ path: resolve(process.cwd(), ".env"), quiet: true });

async function syncToLocal() {
  console.log("🔄 Syncing remote data to local database...\n");

  // Verify environment variables
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const databaseId = process.env.CLOUDFLARE_DATABASE_ID;

  if (!apiToken || !accountId || !databaseId) {
    console.error("❌ Missing required environment variables!");
    process.exit(1);
  }

  try {
    // Create remote database connection
    const db = createRemoteDB(apiToken, accountId, databaseId);

    console.log("📊 Fetching remote data...");

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

    console.log("\n🧹 Clearing local database...");

    // Clear local database
    try {
      execSync(`npx wrangler d1 execute toast-app-db --local --command="DELETE FROM toasts"`, {
        stdio: "pipe",
        env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
      });
      execSync(`npx wrangler d1 execute toast-app-db --local --command="DELETE FROM users"`, {
        stdio: "pipe",
        env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
      });
      console.log("   ✅ Local database cleared");
    } catch (_error) {
      console.log("   ⚠️ Could not clear local database (might be empty)");
    }

    console.log("\n👥 Syncing users...");

    // Sync users to local
    for (const user of remoteUsers) {
      const sql = `INSERT INTO users (userID, name) VALUES ('${user.userID}', '${user.name}');`;
      try {
        execSync(`npx wrangler d1 execute toast-app-db --local --command="${sql}"`, {
          stdio: "pipe",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        });
        console.log(`   ✅ Synced user: ${user.name}`);
      } catch (_error) {
        console.log(`   ⚠️ Failed to sync user: ${user.name}`);
      }
    }

    console.log("\n🍞 Syncing toasts...");

    // Sync toasts to local
    for (const toast of remoteToasts) {
      const sql = `INSERT INTO toasts (toastID, toasterID, toastieID, toastTime) VALUES ('${toast.toastID}', '${toast.toasterID}', '${toast.toastieID}', '${toast.toastTime}');`;
      try {
        execSync(`npx wrangler d1 execute toast-app-db --local --command="${sql}"`, {
          stdio: "pipe",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        });
        console.log(`   ✅ Synced toast: ${toast.toastID.substring(0, 8)}...`);
      } catch (_error) {
        console.log(`   ⚠️ Failed to sync toast: ${toast.toastID.substring(0, 8)}...`);
      }
    }

    console.log("\n✨ Sync completed successfully!\n");
    console.log("💡 Your local database now matches the remote database");
    console.log("💡 You can now run 'npm run dev' to test with real data");
  } catch (error) {
    console.error("\n❌ Sync failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

// Run the sync
syncToLocal();
