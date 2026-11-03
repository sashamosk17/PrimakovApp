import { BoardingCheckIn } from "../entities/BoardingCheckIn";
import { WeekendLeaveRequest } from "../entities/WeekendLeaveRequest";

export interface StudentBoardingStatus {
  lastCheckIn?: BoardingCheckIn;
  activeLeave?: WeekendLeaveRequest;
  recentCheckIns?: BoardingCheckIn[];
}

export interface BoardingRosterItem {
  studentId: string;
  studentName: string;
  groupName: string;
  roomNumber?: string;
  status: string;
  lastCheckInTime?: string;
  hasActiveLeave: boolean;
  transportType?: string;
}

export interface IBoardingRepository {
  checkIn(checkIn: BoardingCheckIn): Promise<void>;
  getStudentStatus(studentId: string): Promise<StudentBoardingStatus>;
  createLeaveRequest(request: WeekendLeaveRequest): Promise<void>;
  getLeaveRequests(studentId?: string): Promise<WeekendLeaveRequest[]>;
  getBoardingRoster(date?: string): Promise<BoardingRosterItem[]>;
}

