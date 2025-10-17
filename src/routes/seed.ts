import { Hono } from 'hono';
import { createDB } from '../db';
import { users, toasts } from '../db/schema';
import type { Env } from '../types/env';

const seedRoutes = new Hono<{ Bindings: Env }>();

// Seed the database with sample data
seedRoutes.post('/seed', async (c) => {
  try {
    const db = createDB(c.env);
    
    // Clear existing data (optional)
    // await db.delete(toasts);
    // await db.delete(users);
    
    // Seed users
    const sampleUsers = [
      { userID: '550e8400-e29b-41d4-a716-446655440001', name: 'Alice Johnson' },
      { userID: '550e8400-e29b-41d4-a716-446655440002', name: 'Bob Smith' },
      { userID: '550e8400-e29b-41d4-a716-446655440003', name: 'Charlie Brown' },
      { userID: '550e8400-e29b-41d4-a716-446655440004', name: 'Diana Prince' }
    ];
    
    const createdUsers = await db.insert(users).values(sampleUsers).returning();
    
    // Seed toasts
    const sampleToasts = [
      {
        toastID: '650e8400-e29b-41d4-a716-446655440001',
        toasterID: '550e8400-e29b-41d4-a716-446655440001', // Alice
        toastieID: '550e8400-e29b-41d4-a716-446655440002'  // Bob
      },
      {
        toastID: '650e8400-e29b-41d4-a716-446655440002',
        toasterID: '550e8400-e29b-41d4-a716-446655440002', // Bob
        toastieID: '550e8400-e29b-41d4-a716-446655440003'  // Charlie
      },
      {
        toastID: '650e8400-e29b-41d4-a716-446655440003',
        toasterID: '550e8400-e29b-41d4-a716-446655440003', // Charlie
        toastieID: '550e8400-e29b-41d4-a716-446655440001'  // Alice
      },
      {
        toastID: '650e8400-e29b-41d4-a716-446655440004',
        toasterID: '550e8400-e29b-41d4-a716-446655440004', // Diana
        toastieID: '550e8400-e29b-41d4-a716-446655440001'  // Alice
      }
    ];
    
    const createdToasts = await db.insert(toasts).values(sampleToasts).returning();
    
    return c.json({
      message: 'Database seeded successfully!',
      users: createdUsers,
      toasts: createdToasts
    }, 201);
    
  } catch (error) {
    console.error('Seeding error:', error);
    return c.json({ 
      error: 'Failed to seed database',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, 500);
  }
});

// Clear all data
seedRoutes.delete('/clear', async (c) => {
  try {
    const db = createDB(c.env);
    
    // Delete in correct order (toasts first due to foreign keys)
    await db.delete(toasts);
    await db.delete(users);
    
    return c.json({ message: 'Database cleared successfully!' });
  } catch (error) {
    return c.json({ error: 'Failed to clear database' }, 500);
  }
});

export { seedRoutes };