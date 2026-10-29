import { Lesson } from "./Lesson";
import { TimeSlot } from "../value-objects/TimeSlot";

export class Schedule {
  public updatedAt: Date;

  constructor(
    public readonly id: string,
    public groupId: string,
    public date: Date,
    public lessons: Lesson[],
    public createdAt: Date,
    updatedAt?: Date
  ) {
    this.updatedAt = updatedAt ?? createdAt;
  }

  public getLessonAt(timeSlot: TimeSlot): Lesson | null {
    return this.lessons.find((lesson) => lesson.timeSlot.overlaps(timeSlot)) || null;
  }

  public isComplete(): boolean {
    return this.lessons.length > 0;
  }

  public hasFreeSlot(timeSlot: TimeSlot): boolean {
    return !this.lessons.some((lesson) => lesson.timeSlot.overlaps(timeSlot));
  }
}
