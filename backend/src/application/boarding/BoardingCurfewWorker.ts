import { IBoardingRepository, BoardingRosterItem } from "../../domain/repositories/IBoardingRepository";
import { IAuditRepository } from "../../domain/repositories/IAuditRepository";
import { Result } from "../../shared/Result";

export interface CurfewCheckReport {
  totalBoardingStudents: number;
  presentCount: number;
  onLeaveCount: number;
  unaccountedAbsences: BoardingRosterItem[];
}

export class BoardingCurfewWorker {
  private timer: NodeJS.Timeout | null = null;
  private isTicking = false;

  constructor(
    private readonly boardingRepo: IBoardingRepository,
    private readonly auditRepo?: IAuditRepository
  ) {}

  public start(intervalMs = 300000): void {
    if (this.timer) return;
    this.timer = setInterval(() => {
      this.tick().catch((err) => {
        console.error("BoardingCurfewWorker tick error:", err);
      });
    }, intervalMs);
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

  public async tick(curfewTime = "21:30"): Promise<Result<CurfewCheckReport>> {
    if (this.isTicking) {
      return Result.ok({
        totalBoardingStudents: 0,
        presentCount: 0,
        onLeaveCount: 0,
        unaccountedAbsences: [],
      });
    }

    this.isTicking = true;
    try {
      const roster = await this.boardingRepo.getBoardingRoster();
      const totalBoardingStudents = roster.length;
      let presentCount = 0;
      let onLeaveCount = 0;
      const unaccountedAbsences: BoardingRosterItem[] = [];

      for (const student of roster) {
        const isPresent = student.status?.toUpperCase() === "PRESENT";
        const hasLeave = Boolean(student.hasActiveLeave);

        if (isPresent) {
          presentCount++;
        } else if (hasLeave) {
          onLeaveCount++;
        } else {
          // Unaccounted absence during curfew
          unaccountedAbsences.push(student);

          if (this.auditRepo) {
            await this.auditRepo.record({
              userId: null,
              userEmail: "boarding-curfew@primakov.school",
              userName: "Boarding Curfew Monitor",
              action: "BOARDING_CURFEW_VIOLATION",
              entity: "BOARDING",
              entityId: student.studentId,
              details: {
                studentName: student.studentName,
                groupName: student.groupName,
                roomNumber: student.roomNumber,
                curfewTime,
                detectedAt: new Date().toISOString(),
                status: student.status,
              },
              ipAddress: "127.0.0.1",
            });
          }
        }
      }

      return Result.ok({
        totalBoardingStudents,
        presentCount,
        onLeaveCount,
        unaccountedAbsences,
      });
    } catch (err: any) {
      console.error("BoardingCurfewWorker error:", err);
      return Result.fail(err?.message || "Failed to execute curfew check");
    } finally {
      this.isTicking = false;
    }
  }
}

