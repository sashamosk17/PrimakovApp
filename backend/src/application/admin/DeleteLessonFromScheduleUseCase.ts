import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Result } from "../../shared/Result";

export interface DeleteLessonInput {
  scheduleId: string;
  lessonId: string;
}

export class DeleteLessonFromScheduleUseCase {
  constructor(private readonly scheduleRepo: IScheduleRepository) {}

  async execute(input: DeleteLessonInput): Promise<Result<void>> {
    let schedule = await this.scheduleRepo.findById(input.scheduleId);

    if (!schedule) {
      const allSchedulesRes = await this.scheduleRepo.getAll();
      if (allSchedulesRes.isSuccess && allSchedulesRes.value) {
        schedule = allSchedulesRes.value.find((s) => s.id === input.scheduleId);
      }
    }

    if (!schedule) {
      return Result.fail("Schedule not found");
    }

    const lessonExists = schedule.lessons.some((l) => l.id === input.lessonId);
    if (!lessonExists) {
      return Result.fail("Lesson not found in schedule");
    }

    schedule.lessons = schedule.lessons.filter((l) => l.id !== input.lessonId);
    schedule.updatedAt = new Date();

    const updateRes = await this.scheduleRepo.update(schedule);
    if (updateRes.isFailure) {
      return Result.fail(updateRes.error || "Failed to update schedule");
    }

    return Result.ok();
  }
}
