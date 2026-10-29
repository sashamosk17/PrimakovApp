import dotenv from "dotenv";
import path from "path";
import { createDatabasePool, closeDatabasePool } from "../src/infrastructure/config/database";
import { runMigrations } from "../src/infrastructure/database/migrations/migrationRunner";

// Load environment variables
dotenv.config({ path: path.join(__dirname, "..", ".env") });

async function migrate() {
  console.log("Running migrations manually...\n");

  const pool = await createDatabasePool();

  try {
    await runMigrations(pool);
    console.log("\n✓ Migration process completed");
  } catch (error) {
    console.error("\n✗ Migration failed:", error);
    process.exit(1);
  } finally {
    await closeDatabasePool();
  }
}

migrate();
