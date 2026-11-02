import { ProcessDeadlineNotificationsUseCase } from "./ProcessDeadlineNotificationsUseCase";

export class DeadlineNotificationWorker {
  private timer: NodeJS.Timeout | null = null;
  private isRunning: boolean = false;

  constructor(
    private readonly useCase: ProcessDeadlineNotificationsUseCase,
    private readonly intervalMs: number = 15 * 60 * 1000 // default 15 min
  ) {}

  public start(): void {
    if (this.timer) return;
    this.isRunning = true;
    // Initial run
    this.tick();
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    console.log(`[DeadlineNotificationWorker] Started with interval ${this.intervalMs}ms`);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.isRunning = false;
    console.log("[DeadlineNotificationWorker] Stopped");
  }

  public async tick(referenceTime?: Date): Promise<{ sentCount: number; checkedCount: number }> {
    try {
      const res = await this.useCase.execute({ referenceTime });
      if (res.isSuccess) {
        if (res.value.sentCount > 0) {
          console.log(
            `[DeadlineNotificationWorker] Dispatched ${res.value.sentCount} push alerts out of ${res.value.checkedCount} pending deadlines.`
          );
        }
        return { sentCount: res.value.sentCount, checkedCount: res.value.checkedCount };
      } else {
        console.error(`[DeadlineNotificationWorker] Failed check: ${res.error}`);
        return { sentCount: 0, checkedCount: 0 };
      }
    } catch (err) {
      console.error("[DeadlineNotificationWorker] Unexpected tick error:", err);
      return { sentCount: 0, checkedCount: 0 };
    }
  }

  public get active(): boolean {
    return this.isRunning;
  }
}

