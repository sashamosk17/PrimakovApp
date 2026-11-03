import { BoardingCheckIn } from "../../../domain/entities/BoardingCheckIn";
import { WeekendLeaveRequest } from "../../../domain/entities/WeekendLeaveRequest";
import {
  IBoardingRepository,
  StudentBoardingStatus,
  BoardingRosterItem,
} from "../../../domain/repositories/IBoardingRepository";

export class MockBoardingRepository implements IBoardingRepository {
  private checkIns: BoardingCheckIn[] = [];
  private leaveRequests: WeekendLeaveRequest[] = [];

  async checkIn(checkIn: BoardingCheckIn): Promise<void> {
    this.checkIns.push(checkIn);
  }

  async getStudentStatus(studentId: string): Promise<StudentBoardingStatus> {
    const studentCheckIns = this.checkIns
      .filter((c) => c.studentId === studentId)
      .sort((a, b) => b.checkInTime.getTime() - a.checkInTime.getTime());

    const activeLeaves = this.leaveRequests
      .filter((l) => l.studentId === studentId && l.status === "APPROVED")
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    return {
      lastCheckIn: studentCheckIns[0],
      activeLeave: activeLeaves[0],
      recentCheckIns: studentCheckIns.slice(0, 10),
    };
  }

  async createLeaveRequest(request: WeekendLeaveRequest): Promise<void> {
    this.leaveRequests.push(request);
  }

  async getLeaveRequests(studentId?: string): Promise<WeekendLeaveRequest[]> {
    let list = this.leaveRequests;
    if (studentId) {
      list = list.filter((r) => r.studentId === studentId);
    }
    return [...list].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getBoardingRoster(_date?: string): Promise<BoardingRosterItem[]> {
    const studentMap = new Map<string, BoardingRosterItem>();

    for (const c of this.checkIns) {
      if (!studentMap.has(c.studentId)) {
        studentMap.set(c.studentId, {
          studentId: c.studentId,
          studentName: "Ученик Пансиона",
          groupName: "10А",
          status: c.status,
          lastCheckInTime: c.checkInTime.toISOString(),
          hasActiveLeave: false,
        });
      }
    }

    if (studentMap.size === 0) {
      return [
        {
          studentId: "student-b-1",
          studentName: "Даниил Смирнов",
          groupName: "11Б",
          roomNumber: "204",
          status: "PRESENT",
          lastCheckInTime: new Date().toISOString(),
          hasActiveLeave: false,
        },
      ];
    }

    return Array.from(studentMap.values());
  }

  clear(): void {
    this.checkIns = [];
    this.leaveRequests = [];
  }
}

