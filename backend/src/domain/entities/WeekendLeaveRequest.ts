export type LeaveTransportType = "SHUTTLE" | "PARENTS" | "INDEPENDENT";
export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED";

export class WeekendLeaveRequest {
  constructor(
    public readonly id: string,
    public readonly studentId: string,
    public readonly departureDate: string,
    public readonly returnDate: string,
    public readonly transportType: LeaveTransportType,
    public status: LeaveStatus = "PENDING",
    public readonly guardianConfirmed: boolean = false,
    public readonly createdAt: Date = new Date()
  ) {}

  public toJSON() {
    return {
      id: this.id,
      studentId: this.studentId,
      departureDate: this.departureDate,
      returnDate: this.returnDate,
      transportType: this.transportType,
      status: this.status,
      guardianConfirmed: this.guardianConfirmed,
      createdAt: this.createdAt.toISOString(),
    };
  }
}

