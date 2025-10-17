import { eq } from "drizzle-orm";
import { Hono } from "hono";
import { createDB } from "../db";
import { toasts, users } from "../db/schema";
import type { Env } from "../types/env";

const toastRoutes = new Hono<{ Bindings: Env }>();

// Get all toasts
toastRoutes.get("/", async (c) => {
  try {
    const db = createDB(c.env);
    const allToasts = await db.select().from(toasts);
    const allUsers = await db.select().from(users);

    // Create user lookup map for efficient name resolution
    const userMap = allUsers.reduce((acc: Record<string, string>, user) => {
      acc[user.userID] = user.name;
      return acc;
    }, {});

    // Format toasts with user names
    const formattedToasts = allToasts.map((toast) => ({
      toastID: toast.toastID,
      toastTime: toast.toastTime,
      toaster: {
        userID: toast.toasterID,
        name: userMap[toast.toasterID] || "Unknown",
      },
      toastie: {
        userID: toast.toastieID,
        name: userMap[toast.toastieID] || "Unknown",
      },
    }));

    return c.json({
      success: true,
      count: formattedToasts.length,
      toasts: formattedToasts,
    });
  } catch (error) {
    return c.json(
      {
        success: false,
        error: "Failed to fetch toasts",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      500
    );
  }
});

// Send a toast (create new toast)
toastRoutes.post("/send", async (c) => {
  try {
    const { toastID, toasterID, toastieID } = await c.req.json();

    if (!toastID || !toasterID || !toastieID) {
      return c.json({ error: "toastID, toasterID, and toastieID are required" }, 400);
    }

    if (toasterID === toastieID) {
      return c.json({ error: "Cannot toast yourself!" }, 400);
    }

    const db = createDB(c.env);

    // Verify both users exist
    const [toaster, toastie] = await Promise.all([
      db.select().from(users).where(eq(users.userID, toasterID)),
      db.select().from(users).where(eq(users.userID, toastieID)),
    ]);

    if (toaster.length === 0) {
      return c.json({ error: "Toaster user not found" }, 404);
    }
    if (toastie.length === 0) {
      return c.json({ error: "Toastie user not found" }, 404);
    }

    const newToast = await db
      .insert(toasts)
      .values({
        toastID,
        toasterID,
        toastieID,
      })
      .returning();

    return c.json(
      {
        success: true,
        message: `${toaster[0].name} toasted ${toastie[0].name}! 🥂`,
        toast: newToast[0],
      },
      201
    );
  } catch (_error) {
    return c.json({ error: "Failed to send toast" }, 500);
  }
});

// Get my toasts (toasts I've sent and received)
toastRoutes.post("/my-toasts", async (c) => {
  try {
    const { userID } = await c.req.json();

    if (!userID) {
      return c.json({ error: "userID is required" }, 400);
    }

    const db = createDB(c.env);

    // Verify user exists
    const user = await db.select().from(users).where(eq(users.userID, userID));
    if (user.length === 0) {
      return c.json({ error: "User not found" }, 404);
    }

    // Get toasts sent by this user
    const sentToasts = await db
      .select({
        toastID: toasts.toastID,
        toastTime: toasts.toastTime,
        toastieID: toasts.toastieID,
        toastieName: users.name,
      })
      .from(toasts)
      .innerJoin(users, eq(toasts.toastieID, users.userID))
      .where(eq(toasts.toasterID, userID));

    // Get toasts received by this user
    const receivedToasts = await db
      .select({
        toastID: toasts.toastID,
        toastTime: toasts.toastTime,
        toasterID: toasts.toasterID,
        toasterName: users.name,
      })
      .from(toasts)
      .innerJoin(users, eq(toasts.toasterID, users.userID))
      .where(eq(toasts.toastieID, userID));

    return c.json({
      success: true,
      user: user[0].name,
      toasts: {
        sent: sentToasts.map((t) => ({ ...t, type: "sent" })),
        received: receivedToasts.map((t) => ({ ...t, type: "received" })),
        totalSent: sentToasts.length,
        totalReceived: receivedToasts.length,
      },
    });
  } catch (_error) {
    return c.json({ error: "Failed to fetch toasts" }, 500);
  }
});

// Find users to toast (search by name - but don't expose all users)
toastRoutes.post("/find-users", async (c) => {
  try {
    const { searchTerm, currentUserID } = await c.req.json();

    if (!searchTerm || !currentUserID) {
      return c.json({ error: "searchTerm and currentUserID are required" }, 400);
    }

    if (searchTerm.length < 2) {
      return c.json({ error: "Search term must be at least 2 characters" }, 400);
    }

    const db = createDB(c.env);

    // Search for users by name (excluding current user)
    const foundUsers = await db
      .select({
        userID: users.userID,
        name: users.name,
      })
      .from(users)
      .where(
        // Simple name search - in production you'd want better search
        // This is a basic LIKE equivalent for SQLite
        eq(users.name, searchTerm) // You can improve this with LIKE when available
      )
      .limit(10);

    // Filter out current user
    const filteredUsers = foundUsers.filter((user) => user.userID !== currentUserID);

    return c.json({
      success: true,
      users: filteredUsers,
      searchTerm,
    });
  } catch (_error) {
    return c.json({ error: "Failed to search users" }, 500);
  }
});

export { toastRoutes };
