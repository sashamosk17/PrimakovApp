import { Result } from "../../shared/Result";

export class TimeSlot {
  private constructor(private readonly _startTime: string, private readonly _endTime: string) {}

  public get startTime(): string {
    return this._startTime;
  }

  public get endTime(): string {
    return this._endTime;
  }

  public static create(startTime: string, endTime: string): Result<TimeSlot> {
    if (!startTime || !endTime) {
      return Result.fail("Invalid time slot");
    }
    return Result.ok(new TimeSlot(startTime, endTime));
  }

  public durationMinutes(): number {
    const [sh, sm] = this._startTime.split(":").map(Number);
    const [eh, em] = this._endTime.split(":").map(Number);
    return (eh * 60 + em) - (sh * 60 + sm);
  }

  public overlaps(other: TimeSlot): boolean {
    const thisStart = this._startTime;
    const thisEnd = this._endTime;
    return thisStart < other.endTime && thisEnd > other.startTime;
  }
}
