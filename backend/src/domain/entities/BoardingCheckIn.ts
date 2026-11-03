export type CheckInStatus = "PRESENT" | "LATE" | "ABSENT" | "ON_LEAVE";

export class BoardingCheckIn {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly checkInTime: Date = new Date(),
    public readonly status: CheckInStatus = "PRESENT",
    public readonly notes?: string
  ) {}

  public toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      checkInTime: this.checkInTime.toISOString(),
      status: this.status,
      notes: this.notes || null,
    };
  }
}

