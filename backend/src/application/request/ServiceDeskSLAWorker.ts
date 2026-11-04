import { IRequestRepository } from "../../domain/repositories/IRequestRepository";
import { IAuditRepository } from "../../domain/repositories/IAuditRepository";
import { TicketAutoRouter } from "../../domain/services/TicketAutoRouter";
import { Result } from "../../shared/Result";

export interface SlaWorkerTickResult {
  checked: number;
  breached: number;
  newlyBreached: number;
}

export class ServiceDeskSLAWorker {
  private timer: NodeJS.Timeout | null = null;
  private isTicking = false;

  constructor(
    private readonly requestRepo: IRequestRepository,
    private readonly auditRepo?: IAuditRepository
  ) {}

  public start(intervalMs = 60000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        console.error("ServiceDeskSLAWorker tick error:", err);
      });
    }, intervalMs);
    // Unref so the process doesn't hang in tests or shutdown
    if (typeof this.timer?.unref === "function") {
      this.timer.unref();
    }
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public async tick(): Promise<Result<SlaWorkerTickResult>> {
    if (this.isTicking) {
      return Result.ok({ checked: 0, breached: 0, newlyBreached: 0 });
    }

    this.isTicking = true;
    try {
      const activeRes = await this.requestRepo.getActive();
      if (activeRes.isFailure || !activeRes.value) {
        return Result.fail(activeRes.error || "Failed to retrieve active requests");
      }

      const now = new Date();
      let checked = 0;
      let breached = 0;
      let newlyBreached = 0;

      for (const req of activeRes.value) {
        if (req.status === "COMPLETED" || req.status === "CANCELLED") {
          continue;
        }

        checked++;

        // Ensure SLA deadline is set
        let slaDeadline = req.slaDeadlineAt;
        if (!slaDeadline) {
          slaDeadline = TicketAutoRouter.calculateSlaDeadline(req.createdAt, req.priority);
          req.slaDeadlineAt = slaDeadline;
          await this.requestRepo.update(req);
        }

        // Check breach
        if (now > slaDeadline) {
          breached++;

          if (!req.slaBreached) {
            req.slaBreached = true;
            req.updatedAt = now;
            await this.requestRepo.update(req);
            newlyBreached++;

            if (this.auditRepo) {
              await this.auditRepo.record({
                userId: null,
                userEmail: "sla-watchdog@primakov.school",
                userName: "SLA Watchdog Worker",
                action: "SLA_BREACH_DETECTED",
                entity: "REQUEST",
                entityId: req.id,
                details: {
                  title: req.title,
                  priority: req.priority,
                  type: req.type,
                  slaDeadlineAt: slaDeadline.toISOString(),
                  breachedAt: now.toISOString(),
                },
                ipAddress: "127.0.0.1",
              });
            }
          }
        }
      }

      return Result.ok({ checked, breached, newlyBreached });
    } finally {
      this.isTicking = false;
    }
  }
}

