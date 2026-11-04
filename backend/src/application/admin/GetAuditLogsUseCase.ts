import { IAuditRepository, AuditLogEntry, AuditQueryOptions } from "../../domain/repositories/IAuditRepository";
import { Result } from "../../shared/Result";

export interface GetAuditLogsInput extends AuditQueryOptions {}

export interface GetAuditLogsOutput {
  logs: AuditLogEntry[];
  total: number;
}

export class GetAuditLogsUseCase {
  constructor(private readonly auditRepo: IAuditRepository) {}

  async execute(input: GetAuditLogsInput = {}): Promise<Result<GetAuditLogsOutput>> {
    try {
      const logsRes = await this.auditRepo.getRecent(input);
      if (!logsRes.isSuccess || !logsRes.value) {
        return Result.fail(logsRes.error || "Failed to retrieve audit logs");
      }

      const countRes = await this.auditRepo.count(input);
      const total = countRes.isSuccess && countRes.value !== undefined ? countRes.value : logsRes.value.length;

      return Result.ok({
        logs: logsRes.value,
        total,
      });
    } catch (err: any) {
      return Result.fail(err?.message || "Failed to retrieve audit logs");
    }
  }
}

