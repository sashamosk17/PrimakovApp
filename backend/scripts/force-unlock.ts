import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function forceUnlock() {
  console.log("Force unlocking all advisory locks...\n");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    // Check current locks
    const locksResult = await pool.query(`
      SELECT
        locktype,
        database,
        classid,
        objid,
        pid,
        granted
      FROM pg_locks
      WHERE locktype = 'advisory'
    `);

    console.log(`Found ${locksResult.rows.length} advisory lock(s):`);
    locksResult.rows.forEach(row => {
      console.log(`  - PID ${row.pid}: classid=${row.classid}, objid=${row.objid}, granted=${row.granted}`);
    });

    if (locksResult.rows.length > 0) {
      // Try to unlock using the specific lock ID
      const lockId = 123456789;

      console.log(`\nAttempting to unlock lock ID ${lockId}...`);
      const unlockResult = await pool.query(
        "SELECT pg_advisory_unlock_all()"
      );

      console.log("✓ Executed pg_advisory_unlock_all()");

      // Check again
      const afterResult = await pool.query(`
        SELECT COUNT(*) as count
        FROM pg_locks
        WHERE locktype = 'advisory'
      `);

      const remaining = parseInt(afterResult.rows[0].count);
      if (remaining > 0) {
        console.log(`\n⚠ ${remaining} lock(s) still remain. These may be from other sessions.`);
        console.log("You may need to restart the PostgreSQL server or terminate the holding process.");
      } else {
        console.log("\n✓ All advisory locks cleared!");
      }
    } else {
      console.log("\n✓ No advisory locks found");
    }

  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

forceUnlock();
