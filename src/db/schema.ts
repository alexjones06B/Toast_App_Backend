import { sql } from "drizzle-orm";
import { sqliteTable, text } from "drizzle-orm/sqlite-core";

// Users table
export const users = sqliteTable("users", {
  userID: text("userID").primaryKey(), // UUID as text
  name: text("name").notNull(),
});

// Toasts table
export const toasts = sqliteTable("toasts", {
  toastID: text("toastID").primaryKey(), // UUID as text
  toasterID: text("toasterID")
    .notNull()
    .references(() => users.userID), // FK to users (who sends the toast)
  toastieID: text("toastieID")
    .notNull()
    .references(() => users.userID), // FK to users (who receives the toast)
  toastTime: text("toastTime").default(sql`CURRENT_TIMESTAMP`).notNull(), // DateTime as ISO string
});

// Type definitions
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Toast = typeof toasts.$inferSelect;
export type NewToast = typeof toasts.$inferInsert;
