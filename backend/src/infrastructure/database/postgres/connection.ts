/**
 * PostgreSQL Database Connection Pool
 *
 * Manages database connections using pg Pool for connection pooling.
 * Provides a singleton pool instance for the entire application.
 */

import { Pool, PoolConfig } from "pg";

// Database configuration from environment variables
const config: PoolConfig = {
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432", 10),
  database: process.env.DB_NAME || "primakov_app",
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",

  // Connection pool settings
  max: parseInt(process.env.DB_POOL_MAX || "20", 10), // Maximum number of clients in the pool
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT || "30000", 10), // Close idle clients after 30s
  connectionTimeoutMillis: parseInt(process.env.DB_CONNECTION_TIMEOUT || "10000", 10), // Return error after 10s if connection cannot be established

  // Keep connection alive
  keepAlive: true,
  keepAliveInitialDelayMillis: 10000,
};

// Singleton pool instance
let pool: Pool | null = null;

/**
 * Get the database connection pool
 * Creates a new pool if one doesn't exist
 */
export function getPool(): Pool {
  if (!pool) {
    pool = new Pool(config);

    // Handle pool errors
    pool.on("error", (err) => {
      console.error("Unexpected error on idle client", err);
      process.exit(-1);
    });

    // Log pool connection
    console.log(`✓ Database pool created: ${config.database}@${config.host}:${config.port}`);
  }

  return pool;
}

/**
 * Close the database connection pool
 * Should be called when shutting down the application
 */
export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end();
    pool = null;
    console.log("✓ Database pool closed");
  }
}

/**
 * Test database connection
 * Useful for health checks and startup validation
 */
export async function testConnection(): Promise<boolean> {
  try {
    const pool = getPool();
    const result = await pool.query("SELECT NOW()");
    console.log("✓ Database connection test successful:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("✗ Database connection test failed:", error);
    return false;
  }
}

/**
 * Execute a query with automatic connection handling
 * Useful for simple queries that don't need transaction control
 */
export async function query(text: string, params?: any[]) {
  const pool = getPool();
  return pool.query(text, params);
}

/**
 * Get a client from the pool for transaction control
 * Remember to release the client after use!
 *
 * Example:
 * ```
 * const client = await getClient();
 * try {
 *   await client.query('BEGIN');
 *   // ... your queries
 *   await client.query('COMMIT');
 * } catch (e) {
 *   await client.query('ROLLBACK');
 *   throw e;
 * } finally {
 *   client.release();
 * }
 * ```
 */
export async function getClient() {
  const pool = getPool();
  return pool.connect();
}
