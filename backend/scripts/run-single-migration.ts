import dotenv from "dotenv";
import path from "path";
import { Pool } from "pg";
import fs from "fs";

dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function runSingleMigration() {
  console.log("Running 004_CreateRatingsTable.sql without transaction...\n");

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || "5432"),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    keepAlive: true,
    keepAliveInitialDelayMillis: 5000,
  });

  try {
    const sql = fs.readFileSync(
      path.join(__dirname, "..", "src", "infrastructure", "database", "migrations", "004_CreateRatingsTable.sql"),
      "utf-8"
    ).replace(/^\uFEFF/, "");

    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);

    console.log(`Found ${statements.length} statement(s)\n`);

    // Execute each statement separately without transaction
    for (let i = 0; i < statements.length; i++) {
      console.log(`Executing statement ${i + 1}/${statements.length}...`);
      console.log(statements[i].substring(0, 100) + "...\n");

      await pool.query(statements[i]);
      console.log(`✓ Statement ${i + 1} completed\n`);
    }

    // Mark as executed
    await pool.query(
      "INSERT INTO migrations (name) VALUES ($1) ON CONFLICT (name) DO NOTHING",
      ["004_CreateRatingsTable.sql"]
    );

    console.log("✓ Migration completed and recorded!");

  } catch (error) {
    console.error("✗ Migration failed:", error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

runSingleMigration();
