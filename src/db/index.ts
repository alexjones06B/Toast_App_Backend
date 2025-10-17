import { drizzle } from "drizzle-orm/d1";
import type { Env } from "../types/env";
import * as schema from "./schema";

export function createDB(env: Env) {
  return drizzle(env.DB, { schema });
}

export type DB = ReturnType<typeof createDB>;

// Export schema for use in routes
export { schema };
