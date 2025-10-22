/**
 * Seed script for local D1 database
 *
 * This script seeds your local D1 database with the same data as remote
 * using wrangler's local database commands.
 *
 * Usage:
 *   npm run db:seed:local
 */

import { execSync } from "node:child_process";
import { resolve } from "node:path";
import { config } from "dotenv";

// Load environment variables from project root
config({ path: resolve(process.cwd(), ".env"), quiet: true });

async function seedLocalDatabase() {
  console.log("🌱 Seeding local D1 database...\n");

  try {
    console.log("👥 Seeding users...");

    // Seed users
    const users = [
      { userID: "550e8400-e29b-41d4-a716-446655440001", name: "Alice Johnson" },
      { userID: "550e8400-e29b-41d4-a716-446655440002", name: "Bob Smith" },
      { userID: "550e8400-e29b-41d4-a716-446655440003", name: "Charlie Brown" },
      { userID: "550e8400-e29b-41d4-a716-446655440004", name: "Diana Prince" },
    ];

    for (const user of users) {
      const sql = `INSERT OR IGNORE INTO users (userID, name) VALUES ('${user.userID}', '${user.name}');`;
      try {
        execSync(`npx wrangler d1 execute toast-app-db --local --command="${sql}"`, {
          stdio: "pipe",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        });
        console.log(`   ✅ Added user: ${user.name}`);
      } catch (_error) {
        console.log(`   ⚠️ User ${user.name} might already exist`);
      }
    }

    console.log("\n🍞 Seeding toasts...");

    // Seed toasts
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
      const sql = `INSERT OR IGNORE INTO toasts (toastID, toasterID, toastieID, toastTime) VALUES ('${toast.toastID}', '${toast.toasterID}', '${toast.toastieID}', datetime('now'));`;
      try {
        execSync(`npx wrangler d1 execute toast-app-db --local --command="${sql}"`, {
          stdio: "pipe",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        });
        console.log(`   ✅ Added toast: ${toast.toastID.substring(0, 8)}...`);
      } catch (_error) {
        console.log(`   ⚠️ Toast ${toast.toastID.substring(0, 8)}... might already exist`);
      }
    }

    // Verify seeding results
    console.log("\n📊 Verification:");

    try {
      const _userCountResult = execSync(
        `npx wrangler d1 execute toast-app-db --local --command="SELECT COUNT(*) as count FROM users"`,
        {
          encoding: "utf-8",
          env: { ...process.env, NODE_TLS_REJECT_UNAUTHORIZED: "0" },
        }
      );
      console.log(`   👥 Local database seeded successfully!`);
    } catch (_error) {
      console.log(`   ⚠️ Could not verify seeding`);
    }

    console.log("\n✨ Local database seeding completed!\n");
    console.log("💡 You can now run 'npm run dev' to test with local data");
  } catch (error) {
    console.error("\n❌ Local seeding failed!");
    if (error instanceof Error) {
      console.error(`   Error: ${error.message}`);
    } else {
      console.error(`   Error:`, error);
    }
    process.exit(1);
  }
}

// Run the seeding
seedLocalDatabase();
