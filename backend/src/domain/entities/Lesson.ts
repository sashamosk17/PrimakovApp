import { TimeSlot } from "../value-objects/TimeSlot";
import { Room } from "../value-objects/Room";

export class Lesson {
  constructor(
    public readonly id: string,
    public subject: string,
    public teacherId: string,
    public timeSlot: TimeSlot,
    public room: Room,
    public floor: number,
    public hasHomework = false,
    public homeworkDescription?: string
  ) {}

  public isNow(): boolean {
    const now = new Date();
    const [sh, sm] = this.timeSlot.startTime.split(":").map(Number);
    const [eh, em] = this.timeSlot.endTime.split(":").map(Number);
    const start = new Date(now);
    start.setHours(sh, sm, 0, 0);
    const end = new Date(now);
    end.setHours(eh, em, 0, 0);
    return now >= start && now <= end;
  }

  public isFinished(): boolean {
    const now = new Date();
    const [eh, em] = this.timeSlot.endTime.split(":").map(Number);
    const end = new Date(now);
    end.setHours(eh, em, 0, 0);
    return now > end;
  }

  public getDuration(): number {
    return this.timeSlot.durationMinutes();
  }
}
