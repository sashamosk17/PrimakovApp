import { Pool } from "pg";
import { IDeadlineNotificationLogRepository } from "../../../domain/repositories/IDeadlineNotificationLogRepository";
import { Result } from "../../../shared/Result";

export class PostgresDeadlineNotificationLogRepository implements IDeadlineNotificationLogRepository {
  constructor(private readonly pool: Pool) {}

  async hasNotificationBeenSent(deadlineId: string, hoursThreshold: 24 | 2): Promise<boolean> {
    try {
      const type = `${hoursThreshold}h`;
      const query = `
        SELECT 1 FROM deadline_notifications
        WHERE deadline_id = $1 AND notification_type = $2
        LIMIT 1
      `;
      const res = await this.pool.query(query, [deadlineId, type]);
      return res.rows.length > 0;
    } catch (error) {
      console.error("Error checking deadline notification status:", error);
      return false;
    }
  }

  async markNotificationSent(
    deadlineId: string,
    hoursThreshold: 24 | 2,
    sentAt: Date
  ): Promise<Result<void>> {
    try {
      const type = `${hoursThreshold}h`;
      const query = `
        INSERT INTO deadline_notifications (deadline_id, notification_type, sent_at)
        VALUES ($1, $2, $3)
        ON CONFLICT (deadline_id, notification_type) DO NOTHING
      `;
      await this.pool.query(query, [deadlineId, type, sentAt]);
      return Result.ok();
    } catch (error) {
      console.error("Error logging deadline notification:", error);
      return Result.fail("Failed to log deadline notification");
    }
  }
}

