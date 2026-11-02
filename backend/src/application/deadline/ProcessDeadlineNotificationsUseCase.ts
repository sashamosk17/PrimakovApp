import { IDeadlineRepository } from "../../domain/repositories/IDeadlineRepository";
import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { IDeadlineNotificationLogRepository } from "../../domain/repositories/IDeadlineNotificationLogRepository";
import {
  IPushNotificationService,
  PushNotificationPayload,
} from "../../domain/services/IPushNotificationService";
import { Result } from "../../shared/Result";
import { DeadlineStatus } from "../../domain/value-objects/DeadlineStatus";

export interface ProcessDeadlineNotificationsInput {
  referenceTime?: Date;
}

export interface ProcessDeadlineNotificationsOutput {
  checkedCount: number;
  sentCount: number;
  notifications: PushNotificationPayload[];
}

export class ProcessDeadlineNotificationsUseCase {
  constructor(
    private readonly deadlineRepo: IDeadlineRepository,
    private readonly notificationRepo: INotificationRepository,
    private readonly logRepo: IDeadlineNotificationLogRepository,
    private readonly pushService: IPushNotificationService
  ) {}

  public async execute(
    input: ProcessDeadlineNotificationsInput = {}
  ): Promise<Result<ProcessDeadlineNotificationsOutput>> {
    try {
      const refTime = input.referenceTime || new Date();

      const deadlinesRes = await this.deadlineRepo.getPendingDeadlines();
      if (deadlinesRes.isFailure || !deadlinesRes.value) {
        return Result.fail(deadlinesRes.error || "Failed to load pending deadlines");
      }

      const pendingDeadlines = deadlinesRes.value.filter(
        (d) => d.status === DeadlineStatus.PENDING
      );

      const dispatched: PushNotificationPayload[] = [];

      for (const deadline of pendingDeadlines) {
        const diffMs = deadline.dueDate.getTime() - refTime.getTime();
        const hoursRemaining = diffMs / (1000 * 60 * 60);

        // We target deadlines within 24h and 2h windows
        let threshold: 24 | 2 | null = null;
        if (hoursRemaining <= 2 && hoursRemaining > 0) {
          threshold = 2;
        } else if (hoursRemaining <= 24 && hoursRemaining > 2) {
          threshold = 24;
        }

        if (threshold === null) {
          continue;
        }

        // Check deduplication
        const alreadySent = await this.logRepo.hasNotificationBeenSent(deadline.id, threshold);
        if (alreadySent) {
          continue;
        }

        // Check user notification preferences
        const prefRes = await this.notificationRepo.findByUserId(deadline.userId);
        if (prefRes.isSuccess && prefRes.value) {
          if (!prefRes.value.pushEnabled || !prefRes.value.deadlineNotifications) {
            continue;
          }
        }

        // Format push payload
        const subjectPart = deadline.subject ? ` (${deadline.subject})` : "";
        const title =
          threshold === 2
            ? "Срочно! Дедлайн через 2 часа"
            : "Напоминание о дедлайне (24 ч)";
        const body =
          threshold === 2
            ? `До сдачи задачи "${deadline.title}"${subjectPart} осталось всего 2 часа! Поторопитесь.`
            : `Напоминаем: срок сдачи задачи "${deadline.title}"${subjectPart} истекает через 24 часа.`;

        const payload: PushNotificationPayload = {
          userId: deadline.userId,
          title,
          body,
          data: {
            type: "DEADLINE_ALERT",
            deadlineId: deadline.id,
            hoursRemaining: threshold,
            title: deadline.title,
            subject: deadline.subject,
            dueDate: deadline.dueDate.toISOString(),
          },
        };

        const sendRes = await this.pushService.send(payload);
        if (sendRes.isSuccess) {
          await this.logRepo.markNotificationSent(deadline.id, threshold, refTime);
          dispatched.push(payload);
        }
      }

      return Result.ok({
        checkedCount: pendingDeadlines.length,
        sentCount: dispatched.length,
        notifications: dispatched,
      });
    } catch (error: any) {
      return Result.fail(`Error processing deadline notifications: ${error.message || error}`);
    }
  }
}

