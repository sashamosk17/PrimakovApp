import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function testConnection() {
  console.log("Testing database connection stability...\n");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    keepAlive: true,
    keepAliveInitialDelayMillis: 10000,
  });

  try {
    const client = await pool.connect();
    console.log("✓ Connected");

    // Test 1: Simple query
    console.log("\nTest 1: Simple query...");
    await client.query("SELECT NOW()");
    console.log("✓ Simple query works");

    // Test 2: Wait 30 seconds
    console.log("\nTest 2: Waiting 30 seconds...");
    await new Promise(resolve => setTimeout(resolve, 30000));
    await client.query("SELECT NOW()");
    console.log("✓ Connection alive after 30s");

    // Test 3: Create and drop test table
    console.log("\nTest 3: Creating test table...");
    await client.query("BEGIN");
    await client.query(`
      CREATE TABLE IF NOT EXISTS test_connection (
        id SERIAL PRIMARY KEY,
        data TEXT
      )
    `);
    await client.query("ROLLBACK");
    console.log("✓ Table creation works");

    client.release();
    console.log("\n✓ All tests passed!");

  } catch (error) {
    console.error("\n✗ Test failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

testConnection();
