import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { runMigrations } from "../src/infrastructure/database/migrations/migrationRunner";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function forceMigrate() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log("Force running migrations...");

    // First, release ALL advisory locks
    console.log("Releasing all advisory locks...");
    await pool.query("SELECT pg_advisory_unlock_all()");

    // Wait a moment
    await new Promise(resolve => setTimeout(resolve, 500));

    // Now run migrations
    await runMigrations(pool);

    console.log("\n✓ Migration complete!");
  } catch (error: any) {
    console.error("Migration failed:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

forceMigrate().catch(console.error);
