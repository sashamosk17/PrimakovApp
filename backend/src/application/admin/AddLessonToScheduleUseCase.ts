import { randomUUID } from "crypto";
import { IScheduleRepository } from "../../domain/repositories/IScheduleRepository";
import { Lesson } from "../../domain/entities/Lesson";
import { TimeSlot } from "../../domain/value-objects/TimeSlot";
import { Room } from "../../domain/value-objects/Room";
import { Result } from "../../shared/Result";

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
  constructor(private readonly scheduleRepo: IScheduleRepository) {}

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

