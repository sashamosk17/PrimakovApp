import { Pool } from "pg";
import { Result } from "../../../shared/Result";
import {
  AuditLogEntry,
  AuditQueryOptions,
  IAuditRepository,
} from "../../../domain/repositories/IAuditRepository";

export class PostgresAuditRepository implements IAuditRepository {
  constructor(private readonly pool: Pool) {}

  async record(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<Result<AuditLogEntry>> {
    try {
      const query = `
        INSERT INTO audit_logs (user_id, action, entity, entity_id, details, ip_address)
        VALUES ($1, $2, $3, $4, $5, $6)
        RETURNING id, user_id, action, entity, entity_id, details, ip_address, created_at
      `;

      const params = [
        entry.userId || null,
        entry.action,
        entry.entity,
        entry.entityId || null,
        entry.details ? JSON.stringify(entry.details) : null,
        entry.ipAddress || null,
      ];

      const res = await this.pool.query(query, params);
      const row = res.rows[0];

      return Result.ok({
        id: row.id,
        userId: row.user_id,
        userEmail: entry.userEmail,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id,
        details: row.details,
        ipAddress: row.ip_address,
        createdAt: new Date(row.created_at),
      });
    } catch (err: any) {
      console.error("[PostgresAuditRepository] Error recording audit log:", err);
      return Result.fail(err?.message || "Failed to record audit log");
    }
  }

  async getRecent(options: AuditQueryOptions = {}): Promise<Result<AuditLogEntry[]>> {
    try {
      const limit = Math.min(Math.max(options.limit || 50, 1), 200);
      const offset = Math.max(options.offset || 0, 0);

      const conditions: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      if (options.entity) {
        conditions.push(`a.entity = $${paramIdx++}`);
        params.push(options.entity);
      }
      if (options.action) {
        conditions.push(`a.action = $${paramIdx++}`);
        params.push(options.action);
      }
      if (options.userId) {
        conditions.push(`a.user_id = $${paramIdx++}`);
        params.push(options.userId);
      }
      if (options.fromDate) {
        conditions.push(`a.created_at >= $${paramIdx++}`);
        params.push(options.fromDate);
      }
      if (options.toDate) {
        conditions.push(`a.created_at <= $${paramIdx++}`);
        params.push(options.toDate);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      const query = `
        SELECT 
          a.id, 
          a.user_id, 
          a.action, 
          a.entity, 
          a.entity_id, 
          a.details, 
          a.ip_address, 
          a.created_at,
          u.email as user_email,
          CONCAT(u.first_name, ' ', u.last_name) as user_name
        FROM audit_logs a
        LEFT JOIN users u ON a.user_id = u.id
        ${whereClause}
        ORDER BY a.created_at DESC
        LIMIT $${paramIdx++} OFFSET $${paramIdx++}
      `;

      params.push(limit, offset);

      const res = await this.pool.query(query, params);

      const entries: AuditLogEntry[] = res.rows.map((row) => ({
        id: row.id,
        userId: row.user_id,
        userEmail: row.user_email || undefined,
        userName: row.user_name ? row.user_name.trim() : undefined,
        action: row.action,
        entity: row.entity,
        entityId: row.entity_id,
        details: row.details,
        ipAddress: row.ip_address,
        createdAt: new Date(row.created_at),
      }));

      return Result.ok(entries);
    } catch (err: any) {
      console.error("[PostgresAuditRepository] Error fetching audit logs:", err);
      return Result.fail(err?.message || "Failed to fetch audit logs");
    }
  }

  async count(options: AuditQueryOptions = {}): Promise<Result<number>> {
    try {
      const conditions: string[] = [];
      const params: any[] = [];
      let paramIdx = 1;

      if (options.entity) {
        conditions.push(`entity = $${paramIdx++}`);
        params.push(options.entity);
      }
      if (options.action) {
        conditions.push(`action = $${paramIdx++}`);
        params.push(options.action);
      }
      if (options.userId) {
        conditions.push(`user_id = $${paramIdx++}`);
        params.push(options.userId);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
      const query = `SELECT COUNT(*)::int as count FROM audit_logs ${whereClause}`;

      const res = await this.pool.query(query, params);
      return Result.ok(res.rows[0]?.count || 0);
    } catch (err: any) {
      return Result.fail(err?.message || "Failed to count audit logs");
    }
  }
}

