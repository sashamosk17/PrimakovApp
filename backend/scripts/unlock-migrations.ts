import dotenv from "dotenv";
import path from "path";
import { createDatabasePool, closeDatabasePool } from "../src/infrastructure/config/database";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function unlockMigrations() {
  console.log("Unlocking migration locks...");

  const pool = await createDatabasePool();

  try {
    // Check for advisory locks
    const locksResult = await pool.query(`
      SELECT * FROM pg_locks WHERE locktype = 'advisory'
    `);

    if (locksResult.rows.length > 0) {
      console.log(`Found ${locksResult.rows.length} advisory lock(s)`);

      // Unlock all advisory locks
      await pool.query("SELECT pg_advisory_unlock_all()");
      console.log("✓ All advisory locks released");
    } else {
      console.log("✓ No advisory locks found");
    }

    // Check migration status
    const migrationsResult = await pool.query(`
      SELECT name, executed_at FROM migrations ORDER BY executed_at DESC LIMIT 5
    `);

    console.log("\nLast 5 migrations:");
    migrationsResult.rows.forEach(row => {
      console.log(`  - ${row.name} (${row.executed_at})`);
    });

  } catch (error) {
    console.error("Error:", error);
  } finally {
    await closeDatabasePool();
  }
}

unlockMigrations();
