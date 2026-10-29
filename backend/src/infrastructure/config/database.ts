import { Pool } from "pg";

export const databaseConfig = {
  host: process.env.DB_HOST || "localhost",
  port: Number(process.env.DB_PORT || 5432),
  user: process.env.DB_USER || "primakov",
  password: process.env.DB_PASSWORD || "primakov",
  database: process.env.DB_NAME || "primakovapp"
};

let pool: Pool | null = null;

export async function createDatabasePool(): Promise<Pool> {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: process.env.DB_HOST || databaseConfig.host,
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT) : databaseConfig.port,
    database: process.env.DB_NAME || databaseConfig.database,
    user: process.env.DB_USER || databaseConfig.user,
    password: process.env.DB_PASSWORD || databaseConfig.password,
    max: 10,
    idleTimeoutMillis: 60000,
    connectionTimeoutMillis: 60000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
    statement_timeout: 120000, // 120 seconds for any single statement
    query_timeout: 120000,
  });

  pool.on("error", (err) => {
    console.error("Unexpected database error:", err);
  });

  try {
    await pool.query("SELECT NOW()");
    console.log("✓ Database connection established");
  } catch (error) {
    console.error("✗ Failed to connect to database:", error);
    throw error;
  }

  return pool;
}

export function getDatabasePool(): Pool {
  if (!pool) {
    throw new Error("Database pool not initialized. Call createDatabasePool() first.");
  }
  return pool;
}

export async function closeDatabasePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("✓ Database connection closed");
  }
}
