export interface UserStatsProps {
  userId: string;
  gpa: number;
  attendanceRate: number;
  totalLessons: number;
  completedDeadlines: number;
  pendingDeadlines: number;
}

export class UserStats {
  constructor(
    public readonly userId: string,
    public readonly gpa: number,
    public readonly attendanceRate: number,
    public readonly totalLessons: number,
    public readonly completedDeadlines: number,
    public readonly pendingDeadlines: number
  ) {}

  public toJSON() {
    return {
      userId: this.userId,
      gpa: this.gpa,
      attendanceRate: this.attendanceRate,
      totalLessons: this.totalLessons,
      completedDeadlines: this.completedDeadlines,
      pendingDeadlines: this.pendingDeadlines,
    };
  }
}

