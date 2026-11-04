import { Pool, PoolClient } from "pg";
import fs from "fs";
import path from "path";

async function executeWithRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  baseDelay: number = 2000
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      const isConnectionError =
        error.message?.includes('Connection terminated') ||
        error.message?.includes('terminating connection') ||
        error.message?.includes('ECONNRESET') ||
        error.message?.includes('ETIMEDOUT');

      if (!isConnectionError || attempt === maxRetries) {
        throw error;
      }

      const delay = baseDelay * Math.pow(2, attempt - 1);
      console.log(`  ⚠ Connection error, retrying in ${delay}ms (attempt ${attempt}/${maxRetries})...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw new Error('Max retries exceeded');
}

export function splitSqlStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inString = false;
  let inDollarQuote = false;
  let dollarTag = "";

  for (let i = 0; i < sql.length; i++) {
    const char = sql[i];
    const nextChar = sql[i + 1] || "";

    // Handle single-line comment (-- comment\n)
    if (!inString && !inDollarQuote && char === "-" && nextChar === "-") {
      while (i < sql.length && sql[i] !== "\n") {
        current += sql[i];
        i++;
      }
      if (i < sql.length) current += sql[i];
      continue;
    }

    // Handle dollar quoting ($$...$$ or $tag$...$tag$)
    if (!inString && char === "$") {
      const remaining = sql.slice(i);
      const match = remaining.match(/^(\$[a-zA-Z0-9_]*\$)/);
      if (match) {
        const tag = match[1];
        if (!inDollarQuote) {
          inDollarQuote = true;
          dollarTag = tag;
        } else if (dollarTag === tag) {
          inDollarQuote = false;
          dollarTag = "";
        }
        current += tag;
        i += tag.length - 1;
        continue;
      }
    }

    // Handle standard single quotes ('...')
    if (!inDollarQuote && char === "'") {
      if (inString && nextChar === "'") {
        current += "''";
        i++;
        continue;
      }
      inString = !inString;
      current += char;
      continue;
    }

    // Handle semicolon delimiter outside quotes
    if (!inString && !inDollarQuote && char === ";") {
      const trimmed = current.trim();
      if (trimmed.length > 0) {
        statements.push(trimmed);
      }
      current = "";
      continue;
    }

    current += char;
  }

  const trimmed = current.trim();
  if (trimmed.length > 0) {
    statements.push(trimmed);
  }

  return statements;
}

let migrationRunning = false;
let lastMigrationAttempt = 0;

export async function runMigrations(pool: Pool): Promise<void> {
  // Prevent multiple migrations in the same process
  if (migrationRunning) {
    console.log("  ⊘ Migration already running in this process. Skipping...");
    return;
  }

  // Prevent rapid successive attempts (from hot reload)
  const now = Date.now();
  if (now - lastMigrationAttempt < 5000) {
    console.log("  ⊘ Migration attempted recently. Skipping...");
    return;
  }
  lastMigrationAttempt = now;

  migrationRunning = true;
  let lockClient: PoolClient | null = null;

  try {
    console.log("Running database migrations...");

    // Use a dedicated client for the lock - session-level lock auto-releases on disconnect
    lockClient = await pool.connect();
    const lockId = 123456789;

    console.log("  → Acquiring migration lock...");
    const lockResult = await lockClient.query(
      "SELECT pg_try_advisory_lock($1) as acquired",
      [lockId]
    );

    if (!lockResult.rows[0].acquired) {
      console.log("  ⊘ Another migration process is running. Skipping...");
      return;
    }

    // Create migrations tracking table
    await lockClient.query(`
      CREATE TABLE IF NOT EXISTS migrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Get list of executed migrations
    const executedResult = await lockClient.query(
      "SELECT name FROM migrations ORDER BY name"
    );
    const executedMigrations = new Set(
      executedResult.rows.map((row) => row.name)
    );

    // Read migration files from candidates
    const candidateDirs = [
      path.join(__dirname),
      path.resolve(__dirname, "../../../../src/infrastructure/database/migrations"),
      path.resolve(process.cwd(), "src/infrastructure/database/migrations"),
      path.resolve(process.cwd(), "dist/infrastructure/database/migrations"),
    ];

    let migrationsDir = path.join(__dirname);
    let files: string[] = [];
    for (const dir of candidateDirs) {
      if (fs.existsSync(dir)) {
        const found = fs.readdirSync(dir).filter((file) => file.endsWith(".sql")).sort();
        if (found.length > 0) {
          migrationsDir = dir;
          files = found;
          break;
        }
      }
    }

    if (files.length === 0) {
      console.log("No migration files found in candidates:", candidateDirs);
      return;
    }

    // Execute new migrations
    let executedCount = 0;
    for (const file of files) {
      if (executedMigrations.has(file)) {
        console.log(`  ⊘ ${file} (already executed)`);
        continue;
      }

      console.log(`  → Running ${file}...`);

      await executeWithRetry(async () => {
        const filePath = path.join(migrationsDir, file);
        const sql = fs.readFileSync(filePath, "utf-8").replace(/^\uFEFF/, "");

        let migrationClient: PoolClient | null = null;
        try {
          migrationClient = await pool.connect();

          // Set longer statement timeout for this connection
          await migrationClient.query("SET statement_timeout = '300000'"); // 5 minutes
          await migrationClient.query("BEGIN");

          const statements = splitSqlStatements(sql);

          console.log(`  → Executing ${statements.length} statement(s)...`);

          for (let i = 0; i < statements.length; i++) {
            console.log(`    → Statement ${i + 1}/${statements.length}...`);
            try {
              await migrationClient.query(statements[i]);
            } catch (stmtError: any) {
              console.error(`    ❌ Failed on statement ${i + 1}/${statements.length}:`);
              console.error(`       Error: ${stmtError?.message || stmtError}`);
              console.error(`       Snippet: ${statements[i].slice(0, 200).replace(/\s+/g, " ")}...`);
              throw stmtError;
            }
          }

          await migrationClient.query("INSERT INTO migrations (name) VALUES ($1)", [file]);
          await migrationClient.query("COMMIT");

          console.log(`  ✓ ${file} completed`);
        } catch (error) {
          if (migrationClient) {
            try {
              await migrationClient.query("ROLLBACK");
            } catch (rollbackError) {
              console.error("  ⚠ Rollback failed:", rollbackError);
            }
          }
          throw error;
        } finally {
          if (migrationClient) {
            try {
              migrationClient.release();
            } catch (releaseError) {
              console.error("  ⚠ Client release failed:", releaseError);
            }
          }
        }
      }, 5, 3000);

      executedCount++;
    }

    if (executedCount === 0) {
      console.log("✓ All migrations up to date");
    } else {
      console.log(`✓ Successfully executed ${executedCount} migration(s)`);
    }
  } catch (error) {
    console.error("Migration error:", error);
    throw error;
  } finally {
    // Release lock client - this also releases the advisory lock
    if (lockClient) {
      try {
        lockClient.release();
        console.log("  → Migration lock released");
      } catch (releaseError) {
        console.error("  ⚠ Lock client release failed:", releaseError);
      }
    }
    migrationRunning = false;
  }
}

export async function resetDatabase(pool: Pool): Promise<void> {
  console.log("⚠ Resetting database...");

  await pool.query(`
    DROP SCHEMA public CASCADE;
    CREATE SCHEMA public;
    GRANT ALL ON SCHEMA public TO primakov;
    GRANT ALL ON SCHEMA public TO public;
  `);

  console.log("✓ Database reset complete");
}
