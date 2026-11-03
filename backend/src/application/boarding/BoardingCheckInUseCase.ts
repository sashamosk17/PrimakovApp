import { randomUUID } from "crypto";
import { BoardingCheckIn, CheckInStatus } from "../../domain/entities/BoardingCheckIn";
import { IBoardingRepository } from "../../domain/repositories/IBoardingRepository";
import { Result } from "../../shared/Result";

export interface BoardingCheckInRequest {
  studentId: string;
  notes?: string;
  latitude?: number;
  longitude?: number;
}

export class BoardingCheckInUseCase {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  public async execute(request: BoardingCheckInRequest): Promise<Result<BoardingCheckIn>> {
    try {
      if (!request.studentId) {
        return Result.fail("Student ID is required");
      }

      const now = new Date();
      // Check evening time (e.g. after 21:00 or standard checkin)
      const hours = now.getHours();
      let status: CheckInStatus = "PRESENT";
      if (hours >= 22 || hours < 6) {
        status = "LATE";
      }

      const checkIn = new BoardingCheckIn(
        randomUUID(),
        request.studentId,
        now,
        status,
        request.notes || "Кампус Раздоры"
      );

      await this.boardingRepository.checkIn(checkIn);

      return Result.ok<BoardingCheckIn>(checkIn);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to record boarding check-in");
    }
  }
}

