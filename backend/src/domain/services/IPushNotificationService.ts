import { Result } from "../../shared/Result";

export interface PushNotificationPayload {
  userId: string;
  title: string;
  body: string;
  data: {
    type: "DEADLINE_ALERT" | "SCHEDULE_CHANGE" | "ANNOUNCEMENT";
    deadlineId?: string;
    hoursRemaining?: number;
    title: string;
    subject?: string;
    dueDate?: string;
    [key: string]: any;
  };
}

export interface IPushNotificationService {
  send(payload: PushNotificationPayload): Promise<Result<void>>;
  sendBatch(payloads: PushNotificationPayload[]): Promise<Result<number>>;
}

