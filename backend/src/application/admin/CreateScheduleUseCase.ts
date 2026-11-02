import { randomUUID } from "crypto";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Schedule } from "../../domain/entities/Schedule";
import { Result } from "../../shared/Result";

export interface CreateScheduleInput {
  groupId: string;
  date: string;
}

export class CreateScheduleUseCase {
  constructor(private readonly scheduleRepo: IScheduleRepository) {}

  async execute(input: CreateScheduleInput): Promise<Result<Schedule>> {
    if (!input.groupId || !input.date) {
      return Result.fail("Group ID and Date are required");
    }

    const targetDate = new Date(input.date);
    const existing = await this.scheduleRepo.getScheduleByDate(input.groupId, targetDate);
    if (existing.isSuccess && existing.value) {
      return Result.ok(existing.value);
    }

    const schedule = new Schedule(
      randomUUID(),
      input.groupId,
      targetDate,
      [],
      new Date(),
      new Date()
    );

    const saveRes = await this.scheduleRepo.save(schedule);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to create schedule");
    }

    return Result.ok(schedule);
  }
}
