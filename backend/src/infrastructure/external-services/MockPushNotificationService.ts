import { IPushNotificationService, PushNotificationPayload } from "../../domain/services/IPushNotificationService";
import { Result } from "../../shared/Result";

export class MockPushNotificationService implements IPushNotificationService {
  public sentNotifications: PushNotificationPayload[] = [];

  async send(payload: PushNotificationPayload): Promise<Result<void>> {
    this.sentNotifications.push(payload);
    return Result.ok();
  }

  async sendBatch(payloads: PushNotificationPayload[]): Promise<Result<number>> {
    this.sentNotifications.push(...payloads);
    return Result.ok(payloads.length);
  }

  clear(): void {
    this.sentNotifications = [];
  }
}

