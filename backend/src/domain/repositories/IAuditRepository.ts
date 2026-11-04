import { Result } from "../../shared/Result";

export interface AuditLogEntry {
  id: string;
  userId: string | null;
  userEmail?: string;
  userName?: string;
  action: string;
  entity: string;
  entityId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  createdAt: Date;
}

export interface AuditQueryOptions {
  limit?: number;
  offset?: number;
  entity?: string;
  action?: string;
  userId?: string;
  fromDate?: Date;
  toDate?: Date;
}

export interface IAuditRepository {
  record(entry: Omit<AuditLogEntry, "id" | "createdAt">): Promise<Result<AuditLogEntry>>;
  getRecent(options?: AuditQueryOptions): Promise<Result<AuditLogEntry[]>>;
  count(options?: AuditQueryOptions): Promise<Result<number>>;
}

