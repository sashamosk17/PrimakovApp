import { NotificationPreferences } from "../entities/NotificationPreferences";
import { Result } from "../../shared/Result";

export interface INotificationRepository {
  findByUserId(userId: string): Promise<Result<NotificationPreferences>>;
  save(preferences: NotificationPreferences): Promise<Result<void>>;
}

