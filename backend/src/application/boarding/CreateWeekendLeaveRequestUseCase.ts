import { randomUUID } from "crypto";
import { WeekendLeaveRequest, LeaveTransportType } from "../../domain/entities/WeekendLeaveRequest";
import { IBoardingRepository } from "../../domain/repositories/IBoardingRepository";
import { Result } from "../../shared/Result";

export interface CreateWeekendLeaveRequestDTO {
  studentId: string;
  departureDate: string;
  returnDate: string;
  transportType: LeaveTransportType;
  guardianConfirmed?: boolean;
}

export class CreateWeekendLeaveRequestUseCase {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  public async execute(request: CreateWeekendLeaveRequestDTO): Promise<Result<WeekendLeaveRequest>> {
    try {
      if (!request.studentId) {
        return Result.fail("Student ID is required");
      }
      if (!request.departureDate || !request.returnDate) {
        return Result.fail("Departure date and return date are required");
      }

      const validTransport: LeaveTransportType[] = ["SHUTTLE", "PARENTS", "INDEPENDENT"];
      if (!validTransport.includes(request.transportType)) {
        return Result.fail(`Invalid transport type: ${request.transportType}`);
      }

      const leaveRequest = new WeekendLeaveRequest(
        randomUUID(),
        request.studentId,
        request.departureDate,
        request.returnDate,
        request.transportType,
        "PENDING",
        request.guardianConfirmed ?? false,
        new Date()
      );

      await this.boardingRepository.createLeaveRequest(leaveRequest);

      return Result.ok<WeekendLeaveRequest>(leaveRequest);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to create leave request");
    }
  }
}

