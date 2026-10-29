import fs from "fs";
import path from "path";

export interface AgentShieldViolation {
  file: string;
  rule: string;
  details: string;
  line?: number;
}

export interface AgentShieldAuditResult {
  isCompliant: boolean;
  checkedFilesCount: number;
  violations: AgentShieldViolation[];
  timestamp: string;
}

/**
 * AgentShield — Built-in Architectural & Security Guard
 *
 * Enforces Clean Architecture isolation boundaries:
 * - Controllers MUST NOT import pg/database drivers directly.
 * - Controllers MUST NOT execute raw SQL queries (SELECT, INSERT, UPDATE, DELETE).
 * - Controllers MUST NOT access pg.Pool or pg.Client instances directly.
 * - All data access must go through Use Cases or Repository interfaces.
 */
export class AgentShield {
  private static readonly FORBIDDEN_IMPORTS = [
    { pattern: /from\s+["']pg["']/, rule: "DIRECT_PG_IMPORT", message: "Direct import of 'pg' driver in controller" },
    { pattern: /from\s+["']pg-pool["']/, rule: "DIRECT_PG_POOL_IMPORT", message: "Direct import of 'pg-pool' in controller" },
    { pattern: /import\s+.*\{[^}]*Pool[^}]*\}\s+from/, rule: "PG_POOL_IMPORT", message: "Import of Pool class in controller" },
    { pattern: /import\s+.*\{[^}]*Client[^}]*\}\s+from/, rule: "PG_CLIENT_IMPORT", message: "Import of Client class in controller" },
  ];

  private static readonly FORBIDDEN_SQL_PATTERNS = [
    { pattern: /\b(SELECT\s+.+\s+FROM)\b/i, rule: "RAW_SQL_SELECT", message: "Raw SQL SELECT query detected in controller" },
    { pattern: /\b(INSERT\s+INTO\s+.+)\b/i, rule: "RAW_SQL_INSERT", message: "Raw SQL INSERT query detected in controller" },
    { pattern: /\b(UPDATE\s+.+\s+SET)\b/i, rule: "RAW_SQL_UPDATE", message: "Raw SQL UPDATE query detected in controller" },
    { pattern: /\b(DELETE\s+FROM\s+.+)\b/i, rule: "RAW_SQL_DELETE", message: "Raw SQL DELETE query detected in controller" },
    { pattern: /\.(query|executeSql)\s*\(/, rule: "RAW_DB_EXECUTION", message: "Direct database .query() execution detected in controller" },
  ];

  /**
   * Statically audits all controller source files in the specified directory.
   */
  public static auditControllersDirectory(controllersDirPath: string): AgentShieldAuditResult {
    const violations: AgentShieldViolation[] = [];
    let checkedCount = 0;

    if (!fs.existsSync(controllersDirPath)) {
      return {
        isCompliant: true,
        checkedFilesCount: 0,
        violations: [],
        timestamp: new Date().toISOString(),
      };
    }

    const files = fs.readdirSync(controllersDirPath).filter((f) => f.endsWith(".ts") || f.endsWith(".js"));

    for (const file of files) {
      const fullPath = path.join(controllersDirPath, file);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) continue;

      checkedCount++;
      const content = fs.readFileSync(fullPath, "utf-8");
      const lines = content.split("\n");

      // 1. Check forbidden imports
      for (const forbidden of this.FORBIDDEN_IMPORTS) {
        if (forbidden.pattern.test(content)) {
          lines.forEach((lineText, idx) => {
            if (forbidden.pattern.test(lineText)) {
              violations.push({
                file,
                rule: forbidden.rule,
                details: forbidden.message,
                line: idx + 1,
              });
            }
          });
        }
      }

      // 2. Check forbidden SQL keywords and direct DB queries
      for (const forbidden of this.FORBIDDEN_SQL_PATTERNS) {
        if (forbidden.pattern.test(content)) {
          lines.forEach((lineText, idx) => {
            // Ignore comments
            const trimmed = lineText.trim();
            if (trimmed.startsWith("//") || trimmed.startsWith("*") || trimmed.startsWith("/*")) {
              return;
            }
            if (forbidden.pattern.test(lineText)) {
              violations.push({
                file,
                rule: forbidden.rule,
                details: forbidden.message,
                line: idx + 1,
              });
            }
          });
        }
      }
    }

    return {
      isCompliant: violations.length === 0,
      checkedFilesCount: checkedCount,
      violations,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Asserts that all controllers are compliant, throwing an error if violations are found.
   */
  public static assertCompliance(controllersDirPath: string): void {
    const result = this.auditControllersDirectory(controllersDirPath);
    if (!result.isCompliant) {
      const errorMsg = result.violations
        .map((v) => `[${v.rule}] in ${v.file}:${v.line || "?"} - ${v.details}`)
        .join("\n");
      throw new Error(`AgentShield: Clean Architecture violation detected in controllers:\n${errorMsg}`);
    }
  }
}

