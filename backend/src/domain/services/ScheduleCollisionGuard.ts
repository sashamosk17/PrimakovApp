import { Schedule } from "../entities/Schedule";
import { Lesson } from "../entities/Lesson";
import { TimeSlot } from "../value-objects/TimeSlot";
import { Room } from "../value-objects/Room";
import { Result } from "../../shared/Result";

export type CollisionType = "TEACHER_COLLISION" | "ROOM_COLLISION" | "GROUP_COLLISION";

export interface CollisionCheckInput {
  date: Date;
  timeSlot: TimeSlot;
  teacherId: string;
  room?: Room;
  groupId?: string;
  excludeLessonId?: string;
  checkGroup?: boolean;
  checkRoom?: boolean;
  allSchedules: Schedule[];
}

export class ScheduleCollisionGuard {
  /**
   * Validates if a proposed lesson assignment conflicts with existing schedules on that date.
   * Checks for:
   * 1. Group collision (class already has a lesson in that time slot)
   * 2. Teacher collision (teacher is already teaching another class in that time slot)
   * 3. Room collision (classroom is already booked for another lesson in that time slot)
   */
  public validate(input: CollisionCheckInput): Result<void> {
    const targetDateStr = this.normalizeDate(input.date);
    const checkGroup = input.checkGroup ?? true;
    const checkRoom = input.checkRoom ?? true;

    for (const schedule of input.allSchedules) {
      if (this.normalizeDate(schedule.date) !== targetDateStr) {
        continue;
      }

      for (const lesson of schedule.lessons) {
        if (input.excludeLessonId && lesson.id === input.excludeLessonId) {
          continue;
        }

        // Check if timeslots overlap
        if (!lesson.timeSlot.overlaps(input.timeSlot)) {
          continue;
        }

        // 1. Group collision (only if checkGroup is true and groupId is provided)
        if (checkGroup && input.groupId && this.normalizeGroupId(schedule.groupId) === this.normalizeGroupId(input.groupId)) {
          return Result.fail(
            `[GROUP_COLLISION] Класс ${input.groupId} уже имеет урок '${lesson.subject}' в это время (${lesson.timeSlot.startTime}-${lesson.timeSlot.endTime})`
          );
        }

        // 2. Teacher collision
        if (lesson.teacherId === input.teacherId) {
          return Result.fail(
            `[TEACHER_COLLISION] Преподаватель уже ведет урок '${lesson.subject}' в группе '${schedule.groupId}' в это время (${lesson.timeSlot.startTime}-${lesson.timeSlot.endTime})`
          );
        }

        // 3. Room collision (only if checkRoom is true and room is provided)
        if (
          checkRoom &&
          input.room &&
          lesson.room.number.trim().toLowerCase() === input.room.number.trim().toLowerCase() &&
          lesson.room.building.trim().toLowerCase() === input.room.building.trim().toLowerCase()
        ) {
          return Result.fail(
            `[ROOM_COLLISION] Аудитория ${input.room.fullName()} уже занята уроком '${lesson.subject}' (класс ${schedule.groupId}) в это время`
          );
        }
      }
    }

    return Result.ok();
  }

  private normalizeDate(d: Date): string {
    return new Date(d).toISOString().slice(0, 10);
  }

  private normalizeGroupId(g: string): string {
    return g.replace(/[^0-9a-zA-Zа-яА-ЯёЁ]/g, "").toLowerCase();
  }
}
