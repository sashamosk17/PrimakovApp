import { Pool } from "pg";
import { BoardingCheckIn, CheckInStatus } from "../../../domain/entities/BoardingCheckIn";
import {
  WeekendLeaveRequest,
  LeaveTransportType,
  LeaveStatus,
} from "../../../domain/entities/WeekendLeaveRequest";
import {
  IBoardingRepository,
  StudentBoardingStatus,
  BoardingRosterItem,
} from "../../../domain/repositories/IBoardingRepository";

export class PostgresBoardingRepository implements IBoardingRepository {
  constructor(private readonly pool: Pool) {}

  async checkIn(checkIn: BoardingCheckIn): Promise<void> {
    const query = `
      INSERT INTO boarding_checkins (id, student_id, check_in_time, status, notes, created_at)
      VALUES ($1, $2, $3, $4, $5, $6)
    `;
    await this.pool.query(query, [
      checkIn.id,
      checkIn.studentId,
      checkIn.checkInTime,
      checkIn.status,
      checkIn.notes || null,
      new Date(),
    ]);
  }

  async getStudentStatus(studentId: string): Promise<StudentBoardingStatus> {
    const checkInsRes = await this.pool.query(
      `SELECT id, student_id, check_in_time, status, notes
       FROM boarding_checkins
       WHERE student_id = $1
       ORDER BY check_in_time DESC
       LIMIT 10`,
      [studentId]
    );

    const leavesRes = await this.pool.query(
      `SELECT id, student_id, departure_date, return_date, transport_type, status, guardian_confirmed, created_at
       FROM weekend_leave_requests
       WHERE student_id = $1 AND status = 'APPROVED'
       ORDER BY created_at DESC
       LIMIT 1`,
      [studentId]
    );

    const recentCheckIns = checkInsRes.rows.map(this.mapRowToCheckIn);
    const lastCheckIn = recentCheckIns[0];
    const activeLeave = leavesRes.rows.length > 0 ? this.mapRowToLeave(leavesRes.rows[0]) : undefined;

    return {
      lastCheckIn,
      activeLeave,
      recentCheckIns,
    };
  }

  async createLeaveRequest(request: WeekendLeaveRequest): Promise<void> {
    const query = `
      INSERT INTO weekend_leave_requests (id, student_id, departure_date, return_date, transport_type, status, guardian_confirmed, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await this.pool.query(query, [
      request.id,
      request.studentId,
      request.departureDate,
      request.returnDate,
      request.transportType,
      request.status,
      request.guardianConfirmed,
      request.createdAt,
    ]);
  }

  async getLeaveRequests(studentId?: string): Promise<WeekendLeaveRequest[]> {
    let query = `
      SELECT id, student_id, departure_date, return_date, transport_type, status, guardian_confirmed, created_at
      FROM weekend_leave_requests
    `;
    const params: any[] = [];
    if (studentId) {
      query += ` WHERE student_id = $1`;
      params.push(studentId);
    }
    query += ` ORDER BY created_at DESC`;

    const res = await this.pool.query(query, params);
    return res.rows.map(this.mapRowToLeave);
  }

  async getBoardingRoster(_date?: string): Promise<BoardingRosterItem[]> {
    const query = `
      SELECT 
        u.id as student_id,
        CONCAT(u.last_name, ' ', u.first_name) as student_name,
        COALESCE(u.group_name, '') as group_name,
        c.status,
        c.check_in_time,
        EXISTS(
          SELECT 1 FROM weekend_leave_requests l
          WHERE l.student_id = u.id AND l.status = 'APPROVED'
        ) as has_active_leave
      FROM users u
      LEFT JOIN LATERAL (
        SELECT status, check_in_time 
        FROM boarding_checkins 
        WHERE student_id = u.id 
        ORDER BY check_in_time DESC 
        LIMIT 1
      ) c ON true
      WHERE u.role = 'STUDENT' AND u.is_boarding = true
      ORDER BY u.last_name, u.first_name
    `;

    const res = await this.pool.query(query);
    return res.rows.map((row) => ({
      studentId: row.student_id,
      studentName: row.student_name,
      groupName: row.group_name,
      status: row.status || "ABSENT",
      lastCheckInTime: row.check_in_time ? new Date(row.check_in_time).toISOString() : undefined,
      hasActiveLeave: !!row.has_active_leave,
    }));
  }

  private mapRowToCheckIn(row: any): BoardingCheckIn {
    return new BoardingCheckIn(
      row.id,
      row.student_id,
      new Date(row.check_in_time),
      row.status as CheckInStatus,
      row.notes || undefined
    );
  }

  private mapRowToLeave(row: any): WeekendLeaveRequest {
    return new WeekendLeaveRequest(
      row.id,
      row.student_id,
      row.departure_date,
      row.return_date,
      row.transport_type as LeaveTransportType,
      row.status as LeaveStatus,
      row.guardian_confirmed,
      new Date(row.created_at)
    );
  }
}

