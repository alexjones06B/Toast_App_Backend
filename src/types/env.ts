// This file defines the Cloudflare Workers environment bindings
export interface Env {
  // D1 Database binding (will be available once configured)
  DB: D1Database;
  
  // Add other environment variables here
  NODE_ENV?: string;
}