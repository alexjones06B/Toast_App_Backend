// This file defines the Cloudflare Workers environment bindings
export interface Env {
  // D1 Database binding (will be available once configured)
  DB: D1Database;
  
  // Environment variables
  NODE_ENV?: string;
  CLOUDFLARE_API_TOKEN: string;
  CLOUDFLARE_DATABASE_ID: string;
  CLOUDFLARE_DATABASE_NAME: string;
}