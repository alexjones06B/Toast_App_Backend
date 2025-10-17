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
    return c.json({
      success: true,
      count: allUsers.length,
      users: allUsers
    });
  } catch (error) {
    return c.json({ 
      success: false,
      error: 'Failed to fetch users',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Create a new user (register)
userRoutes.post('/register', async (c) => {
  try {
    const { userID, name } = await c.req.json();
    
    if (!userID || !name) {
      return c.json({ error: 'userID and name are required' }, 400);
    }

    const db = createDB(c.env);
    
    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.userID, userID));
    if (existingUser.length > 0) {
      return c.json({ error: 'User already exists' }, 409);
    }

    const newUser = await db.insert(users).values({ userID, name }).returning();
    
    return c.json({ 
      success: true,
      message: 'User registered successfully',
      user: newUser[0]
    }, 201);
  } catch (error) {
    return c.json({ error: 'Failed to register user' }, 500);
  }
});

// Get current user profile (requires userID in request)
userRoutes.post('/profile', async (c) => {
  try {
    const { userID } = await c.req.json();
    
    if (!userID) {
      return c.json({ error: 'userID is required' }, 400);
    }

    const db = createDB(c.env);
    const user = await db.select().from(users).where(eq(users.userID, userID));
    
    if (user.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      success: true,
      user: user[0]
    });
  } catch (error) {
    return c.json({ error: 'Failed to fetch user profile' }, 500);
  }
});

// Update user profile
userRoutes.put('/profile', async (c) => {
  try {
    const { userID, name } = await c.req.json();
    
    if (!userID || !name) {
      return c.json({ error: 'userID and name are required' }, 400);
    }

    const db = createDB(c.env);
    
    const updatedUser = await db
      .update(users)
      .set({ name })
      .where(eq(users.userID, userID))
      .returning();
    
    if (updatedUser.length === 0) {
      return c.json({ error: 'User not found' }, 404);
    }
    
    return c.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser[0]
    });
  } catch (error) {
    return c.json({ error: 'Failed to update profile' }, 500);
  }
});

export { userRoutes };