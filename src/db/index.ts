import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

<<<<<<< HEAD
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required");
}

const globalForDb = globalThis as typeof globalThis & {
  __arenaNextJsPostgresqlPool?: Pool;
};

export const pool =
  globalForDb.__arenaNextJsPostgresqlPool ??
  new Pool({
    connectionString: databaseUrl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb.__arenaNextJsPostgresqlPool = pool;
}

export const db = drizzle(pool);
=======
const globalForDb = globalThis as typeof globalThis & {
  __asversePool?: Pool;
};

let pool: Pool | undefined;
let db: ReturnType<typeof drizzle> | undefined;

if (process.env.DATABASE_URL) {
  pool =
    globalForDb.__asversePool ??
    new Pool({
      connectionString: process.env.DATABASE_URL,
    });

  if (process.env.NODE_ENV !== "production") {
    globalForDb.__asversePool = pool;
  }

  db = drizzle(pool);
}

export { pool, db };
>>>>>>> 399ff1e16a62994408dc07945c77ad211ed6c355
