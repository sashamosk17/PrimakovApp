import { Result } from "../../shared/Result";

export interface IDeadlineNotificationLogRepository {
  hasNotificationBeenSent(deadlineId: string, hoursThreshold: 24 | 2): Promise<boolean>;
  markNotificationSent(deadlineId: string, hoursThreshold: 24 | 2, sentAt: Date): Promise<Result<void>>;
}

