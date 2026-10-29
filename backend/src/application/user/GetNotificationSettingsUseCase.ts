import { INotificationRepository } from "../../domain/repositories/INotificationRepository";
import { NotificationPreferences } from "../../domain/entities/NotificationPreferences";
import { Result } from "../../shared/Result";

export class GetNotificationSettingsUseCase {
  constructor(private readonly notificationRepository: INotificationRepository) {}

  public async execute(userId: string): Promise<Result<NotificationPreferences>> {
    if (!userId) {
      return Result.fail("User ID is required");
    }

    return await this.notificationRepository.findByUserId(userId);
  }
}

