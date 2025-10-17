import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { createDB } from './db';
import { userRoutes } from './routes/users';
import { toastRoutes } from './routes/toasts';
import { seedRoutes } from './routes/seed';
import type { Env } from './types/env';

const app = new Hono<{ Bindings: Env }>();

// Enable CORS for frontend development
app.use('/*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization']
}));

app.get('/', (c) => {
  return c.text('Hello Hono! Toast App Backend is running.');
});

// Health check endpoint
app.get('/health', async (c) => {
  try {
    // Test database connection
    const db = createDB(c.env);
    
    return c.json({ 
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: c.env.DB ? 'connected' : 'not configured'
    });
  } catch (error) {
    return c.json({ 
      status: 'error', 
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, 500);
  }
});

// Mount route handlers
app.route('/api/users', userRoutes);
app.route('/api/toasts', toastRoutes);
app.route('/api', seedRoutes);

export default app;
