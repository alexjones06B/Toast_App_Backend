import { Hono } from 'hono';
import { eq } from 'drizzle-orm';
import { createDB } from '../db';
import { users } from '../db/schema';
import type { Env } from '../types/env';

const userRoutes = new Hono<{ Bindings: Env }>();

// Get all users
userRoutes.get('/', async (c) => {
  try {
    const db = createDB(c.env);
    const allUsers = await db.select().from(users);
    return c.json(allUsers);
  } catch (error) {
    return c.json({ error: 'Failed to fetch users' }, 500);
  }
});

// Create a new user
userRoutes.post('/', async (c) => {
  try {
    const { userID, name } = await c.req.json();
    
    if (!userID || !name) {
      return c.json({ error: 'userID and name are required' }, 400);
    }

    const db = createDB(c.env);
    const newUser = await db.insert(users).values({ userID, name }).returning();
    
    return c.json(newUser[0], 201);
  } catch (error) {
    return c.json({ error: 'Failed to create user' }, 500);
  }
});

// Get a specific user
userRoutes.get('/:id', async (c) => {
  try {
    const userID = c.req.param('id');
    const db = createDB(c.env);
    
    const user = await db.select().from(users).where(eq(users.userID, userID));
    
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json(user[0]);
  } catch (error) {
    return c.json({ error: 'Failed to fetch user' }, 500);
  }
});

export { userRoutes };