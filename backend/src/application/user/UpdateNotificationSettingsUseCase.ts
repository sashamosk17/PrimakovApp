import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { NotificationPreferences } from "../../domain/entities/NotificationPreferences";
import { Result } from "../../shared/Result";

export interface UpdateNotificationSettingsInput {
  userId: string;
  pushEnabled?: boolean;
  deadlineNotifications?: boolean;
  scheduleNotifications?: boolean;
  announcementNotifications?: boolean;
}

export class UpdateNotificationSettingsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(input: UpdateNotificationSettingsInput): Promise<Result<NotificationPreferences>> {
    const { userId, ...props } = input;
    if (!userId) {
      return Result.fail("User ID is required");
    }

    const currentResult = await this.notificationRepository.findByUserId(userId);
    if (currentResult.isFailure) {
      return Result.fail(currentResult.error as string);
    }

    const prefs = currentResult.value;
    prefs.update(props);

    const saveResult = await this.notificationRepository.save(prefs);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error as string);
    }

    return Result.ok(prefs);
  }
}

