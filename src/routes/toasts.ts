import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDB } from '../db';
import { toasts, users } from '../db/schema';
import type { Env } from '../types/env';

const toastRoutes = new Hono<{ Bindings: Env }>();

// Get all toasts
toastRoutes.get('/', async (c) => {
  try {
    const db = createDB(c.env);
    const allToasts = await db.select().from(toasts);
    return c.json(allToasts);
  } catch (error) {
    return c.json({ error: 'Failed to fetch toasts' }, 500);
  }
});

// Create a new toast
toastRoutes.post('/', async (c) => {
  try {
    const { toastID, toasterID, toastieID } = await c.req.json();
    
    if (!toastID || !toasterID || !toastieID) {
      return c.json({ error: 'toastID, toasterID, and toastieID are required' }, 400);
    }

    const db = createDB(c.env);
    const newToast = await db.insert(toasts).values({ 
      toastID, 
      toasterID, 
      toastieID 
    }).returning();
    
    return c.json(newToast[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create toast' }, 500);
  }
});

// Get toasts for a specific user (as toaster or toastie)
toastRoutes.get('/user/:userID', async (c) => {
  try {
    const userID = c.req.param('userID');
    const db = createDB(c.env);
    
    // Get toasts where user is either toaster or toastie
    const userToasts = await db.select().from(toasts).where(
      eq(toasts.toasterID, userID)
    );
    
    const receivedToasts = await db.select().from(toasts).where(
      eq(toasts.toastieID, userID)
    );
    
    return c.json({
      sent: userToasts,
      received: receivedToasts
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch user toasts' }, 500);
  }
});

export { toastRoutes };