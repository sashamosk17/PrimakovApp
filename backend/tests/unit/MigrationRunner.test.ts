import { splitSqlStatements } from "../../src/infrastructure/database/migrations/migrationRunner";

describe("splitSqlStatements", () => {
  it("splits simple statements by semicolon", () => {
    const sql = "SELECT 1; SELECT 2;";
    const statements = splitSqlStatements(sql);
    expect(statements).toEqual(["SELECT 1", "SELECT 2"]);
  });

  it("does not split on semicolon inside single-quoted strings", () => {
    const sql = "INSERT INTO users (name) VALUES ('Smith; John'); SELECT 1;";
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toBe("INSERT INTO users (name) VALUES ('Smith; John')");
    expect(statements[1]).toBe("SELECT 1");
  });

  it("does not split on semicolon inside DO $$ ... $$ blocks", () => {
    const sql = `
      DO $$
      BEGIN
        IF true THEN
          UPDATE users SET role = 'STUDENT';
        END IF;
      END $$;
      SELECT 42;
    `;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(2);
    expect(statements[0]).toContain("DO $$");
    expect(statements[0]).toContain("UPDATE users SET role = 'STUDENT';");
    expect(statements[0]).toContain("END $$");
    expect(statements[1]).toBe("SELECT 42");
  });

  it("handles SQL comments containing semicolons", () => {
    const sql = `
      -- Semicolon in comment; ignore this
      SELECT * FROM lessons;
    `;
    const statements = splitSqlStatements(sql);
    expect(statements).toHaveLength(1);
    expect(statements[0]).toContain("SELECT * FROM lessons");
  });

  it("correctly parses 029_SeedComprehensiveSyntheticData.sql without fragmenting DO blocks", () => {
    const fs = require("fs");
    const path = require("path");
    const migrationPath = path.resolve(__dirname, "../../src/infrastructure/database/migrations/029_SeedComprehensiveSyntheticData.sql");
    const sql = fs.readFileSync(migrationPath, "utf-8");
    const statements = splitSqlStatements(sql);
    expect(statements.length).toBeGreaterThan(5);
    const doBlocks = statements.filter((s: string) => s.includes("DO $$"));
    expect(doBlocks.length).toBe(4);
    for (const block of doBlocks) {
      expect(block.trim().endsWith("END $$")).toBe(true);
    }
  });
});
