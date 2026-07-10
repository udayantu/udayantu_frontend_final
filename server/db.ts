import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema";

const { Pool } = pg;

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn("WARNING: DATABASE_URL environment variable is not set. Database functionality will be unavailable.");
}

const pool = new Pool({
  connectionString: databaseUrl || "postgres://localhost:5432/dummy_db",
});

export const db = drizzle(pool, { schema });

