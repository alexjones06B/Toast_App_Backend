import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createDB } from './db';
import { users } from './db/schema';
import { userRoutes } from './routes/users';
import { toastRoutes } from './routes/toasts';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend development
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

// Mount route modules
app.route('/users', userRoutes);
app.route('/toasts', toastRoutes);

// Root endpoint - API documentation
app.get('/', (c) => {
  return c.json({
    message: "Toast App API",
    version: "1.0.0",
    endpoints: {
      "/": "API documentation",
      "/users": "User management (GET all users)",
      "/users/register": "Register new user (POST)",
      "/users/profile": "Get/update user profile (GET/PUT)",
      "/toasts": "Toast management (GET all toasts)",
      "/toasts/send": "Send a toast (POST)",
      "/toasts/my-toasts": "Get user's toasts (POST)",
      "/toasts/find-users": "Search users (POST)",
      "/health": "Health check"
    }
  });
});

// Health check endpoint
app.get('/health', async (c) => {
  try {
    const db = createDB(c.env);
    const testQuery = await db.select().from(users).limit(1);
    
    return c.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      hasData: testQuery.length > 0
    });
  } catch (error) {
    return c.json({ 
      status: 'error',
      database: 'connection failed',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

export default app;