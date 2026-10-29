import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function checkDatabase() {
  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    console.log("Connecting to database...");

    // Release any stuck advisory locks
    console.log("\n1. Releasing stuck migration locks...");
    await pool.query("SELECT pg_advisory_unlock_all()");
    console.log("✓ All advisory locks released");

    // Check migrations table
    console.log("\n2. Checking migrations status...");
    const migrationsResult = await pool.query(
      "SELECT name, executed_at FROM migrations ORDER BY name"
    );

    if (migrationsResult.rows.length === 0) {
      console.log("⚠ No migrations have been executed yet");
    } else {
      console.log(`✓ ${migrationsResult.rows.length} migrations executed:`);
      migrationsResult.rows.forEach(row => {
        console.log(`  - ${row.name} (${row.executed_at})`);
      });
    }

    // Check users table
    console.log("\n3. Checking users table...");
    const usersResult = await pool.query(
      "SELECT id, email, role FROM users ORDER BY id"
    );

    if (usersResult.rows.length === 0) {
      console.log("⚠ No users found in database");
    } else {
      console.log(`✓ ${usersResult.rows.length} users found:`);
      usersResult.rows.forEach(row => {
        console.log(`  - ${row.email} (${row.role})`);
      });
    }

    // Test login credentials
    console.log("\n4. Testing demo user password hash...");
    const testUser = await pool.query(
      "SELECT email, password_hash FROM users WHERE email = $1",
      ["ivan.petrov@primakov.school"]
    );

    if (testUser.rows.length > 0) {
      console.log(`✓ Found user: ${testUser.rows[0].email}`);
      console.log(`  Password hash: ${testUser.rows[0].password_hash.substring(0, 20)}...`);
    } else {
      console.log("⚠ Demo user not found");
    }

    console.log("\n✓ Database check complete");
  } catch (error: any) {
    console.error("Error:", error.message);
    throw error;
  } finally {
    await pool.end();
  }
}

checkDatabase().catch(console.error);
