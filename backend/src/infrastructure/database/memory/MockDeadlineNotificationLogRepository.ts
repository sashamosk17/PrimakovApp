import { IDeadlineNotificationLogRepository } from "../../../domain/repositories/IDeadlineNotificationLogRepository";
import { Result } from "../../../shared/Result";

export class MockDeadlineNotificationLogRepository implements IDeadlineNotificationLogRepository {
  private logs: Map<string, Date> = new Map();

  private key(deadlineId: string, hoursThreshold: 24 | 2): string {
    return `${deadlineId}_${hoursThreshold}h`;
  }

  async hasNotificationBeenSent(deadlineId: string, hoursThreshold: 24 | 2): Promise<boolean> {
    return this.logs.has(this.key(deadlineId, hoursThreshold));
  }

  async markNotificationSent(
    deadlineId: string,
    hoursThreshold: 24 | 2,
    sentAt: Date
  ): Promise<Result<void>> {
    this.logs.set(this.key(deadlineId, hoursThreshold), sentAt);
    return Result.ok();
  }

  clear(): void {
    this.logs.clear();
  }
}

