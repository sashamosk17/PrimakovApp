import { randomUUID } from "crypto";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Lesson } from "../../domain/entities/Lesson";
import { TimeSlot } from "../../domain/value-objects/TimeSlot";
import { Room } from "../../domain/value-objects/Room";
import { Result } from "../../shared/Result";
import { ScheduleCollisionGuard } from "../../domain/services/ScheduleCollisionGuard";

export interface AddLessonInput {
  scheduleId: string;
  subject: string;
  teacherId: string;
  startTime: string;
  endTime: string;
  roomNumber: string;
  building?: string;
  floor?: number;
  hasHomework?: boolean;
  homeworkDescription?: string;
}

export class AddLessonToScheduleUseCase {
  constructor(
    private readonly scheduleRepo: IScheduleRepository,
    private readonly collisionGuard: ScheduleCollisionGuard = new ScheduleCollisionGuard()
  ) {}

  async execute(input: AddLessonInput): Promise<Result<Lesson>> {
    if (!input.scheduleId) {
      return Result.fail("Schedule ID is required");
    }
    if (!input.subject || !input.teacherId) {
      return Result.fail("Subject and Teacher ID are required");
    }

    const schedule = await this.scheduleRepo.findById(input.scheduleId);
    if (!schedule) {
      return Result.fail("Schedule not found");
    }

    const timeSlotRes = TimeSlot.create(input.startTime, input.endTime);
    if (timeSlotRes.isFailure || !timeSlotRes.value) {
      return Result.fail(timeSlotRes.error || "Invalid time slot");
    }

    const floor = input.floor ?? 1;
    const roomRes = Room.create(input.roomNumber, input.building || "A", floor);
    if (roomRes.isFailure || !roomRes.value) {
      return Result.fail(roomRes.error || "Invalid room");
    }

    // Retrieve all schedules to check for collisions
    const allSchedulesRes = await this.scheduleRepo.getAll();
    const allSchedules = allSchedulesRes.isSuccess && allSchedulesRes.value ? allSchedulesRes.value : [schedule];

    // Check collision guard
    const collisionCheck = this.collisionGuard.validate({
      date: schedule.date,
      timeSlot: timeSlotRes.value,
      teacherId: input.teacherId,
      room: roomRes.value,
      groupId: schedule.groupId,
      allSchedules,
    });

    if (collisionCheck.isFailure) {
      return Result.fail(collisionCheck.error || "Schedule collision detected");
    }

    const lesson = new Lesson(
      randomUUID(),
      input.subject,
      input.teacherId,
      timeSlotRes.value,
      roomRes.value,
      floor,
      input.hasHomework ?? false,
      input.homeworkDescription
    );

    schedule.lessons.push(lesson);
    schedule.updatedAt = new Date();

    const saveRes = await this.scheduleRepo.update(schedule);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to save lesson to schedule");
    }

    return Result.ok(lesson);
  }
}
