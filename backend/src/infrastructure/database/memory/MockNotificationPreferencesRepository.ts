import { INotificationRepository } from "../../../domain/repositories/INotificationRepository";
import { NotificationPreferences } from "../../../domain/entities/NotificationPreferences";
import { Result } from "../../../shared/Result";

export class MockNotificationPreferencesRepository implements INotificationRepository {
  private prefs: Map<string, NotificationPreferences> = new Map();

  async findByUserId(userId: string): Promise<Result<NotificationPreferences>> {
    let userPref = this.prefs.get(userId);
    if (!userPref) {
      userPref = new NotificationPreferences(userId);
      this.prefs.set(userId, userPref);
    }
    return Result.ok(userPref);
  }

  async save(preferences: NotificationPreferences): Promise<Result<void>> {
    this.prefs.set(preferences.userId, preferences);
    return Result.ok();
  }
}

