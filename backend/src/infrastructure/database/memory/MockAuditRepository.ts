import { Result } from "../../../shared/Result";
import {
  AuditLogEntry,
  AuditQueryOptions,
  IAuditRepository,
} from "../../../domain/repositories/IAuditRepository";

export class MockAuditRepository implements IAuditRepository {
  private logs: AuditLogEntry[] = [];

  constructor(initialLogs: AuditLogEntry[] = []) {
    this.logs = [...initialLogs];
  }

  async record(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<Result<AuditLogEntry>> {
    const newEntry: AuditLogEntry = {
      ...entry,
      id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date(),
    };
    this.logs.unshift(newEntry);
    return Result.ok(newEntry);
  }

  async getRecent(options: AuditQueryOptions = {}): Promise<Result<AuditLogEntry[]>> {
    let filtered = [...this.logs];

    if (options.entity) {
      filtered = filtered.filter((l) => l.entity === options.entity);
    }
    if (options.action) {
      filtered = filtered.filter((l) => l.action === options.action);
    }
    if (options.userId) {
      filtered = filtered.filter((l) => l.userId === options.userId);
    }

    const offset = options.offset || 0;
    const limit = options.limit || 50;

    return Result.ok(filtered.slice(offset, offset + limit));
  }

  async count(options: AuditQueryOptions = {}): Promise<Result<number>> {
    const res = await this.getRecent(options);
    return Result.ok(res.isSuccess && res.value ? res.value.length : 0);
  }
}

