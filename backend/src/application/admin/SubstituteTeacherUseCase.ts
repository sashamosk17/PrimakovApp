import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Lesson } from "../../domain/entities/Lesson";
import { Result } from "../../shared/Result";
import { ScheduleCollisionGuard } from "../../domain/services/ScheduleCollisionGuard";

export interface SubstituteTeacherInput {
  scheduleId?: string;
  lessonId: string;
  newTeacherId: string;
  comment?: string;
}

export class SubstituteTeacherUseCase {
  constructor(
    private readonly scheduleRepo: IScheduleRepository,
    private readonly collisionGuard: ScheduleCollisionGuard = new ScheduleCollisionGuard()
  ) {}

  async execute(input: SubstituteTeacherInput): Promise<Result<Lesson>> {
    if (!input.lessonId || !input.newTeacherId) {
      return Result.fail("Lesson ID and new Teacher ID are required");
    }

    let schedule = input.scheduleId
      ? await this.scheduleRepo.findById(input.scheduleId)
      : undefined;

    // If schedule not found directly by scheduleId, scan all schedules
    const allRes = await this.scheduleRepo.getAll();
    const allSchedules = allRes.isSuccess && allRes.value ? allRes.value : [];

    if (!schedule) {
      schedule = allSchedules.find((s) =>
        s.lessons.some((l) => l.id === input.lessonId)
      );
    }

    if (!schedule) {
      return Result.fail("Schedule or lesson not found");
    }

    const lessonIndex = schedule.lessons.findIndex((l) => l.id === input.lessonId);
    if (lessonIndex === -1) {
      return Result.fail("Lesson not found in schedule");
    }

    const oldLesson = schedule.lessons[lessonIndex];

    // Check collision guard for the new substitute teacher (checking teacher availability)
    const collisionCheck = this.collisionGuard.validate({
      date: schedule.date,
      timeSlot: oldLesson.timeSlot,
      teacherId: input.newTeacherId,
      room: oldLesson.room,
      groupId: schedule.groupId,
      excludeLessonId: oldLesson.id,
      checkGroup: false,
      checkRoom: false,
      allSchedules: allSchedules.length > 0 ? allSchedules : [schedule],
    });

    if (collisionCheck.isFailure) {
      return Result.fail(collisionCheck.error || "Schedule collision detected");
    }

    const updatedHomeworkDesc = input.comment
      ? `${oldLesson.homeworkDescription ? oldLesson.homeworkDescription + " | " : ""}[Замена: ${input.comment}]`
      : oldLesson.homeworkDescription;

    const updatedLesson = new Lesson(
      oldLesson.id,
      oldLesson.subject,
      input.newTeacherId,
      oldLesson.timeSlot,
      oldLesson.room,
      oldLesson.floor,
      oldLesson.hasHomework,
      updatedHomeworkDesc
    );

    schedule.lessons[lessonIndex] = updatedLesson;
    schedule.updatedAt = new Date();

    const saveRes = await this.scheduleRepo.update(schedule);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to update schedule lesson");
    }

    return Result.ok(updatedLesson);
  }
}
