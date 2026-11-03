import { IBoardingRepository } from "../../domain/repositories/IBoardingRepository";
import { Result } from "../../shared/Result";

export interface UpdateLeaveRequestStatusDTO {
  requestId: string;
  status: "APPROVED" | "REJECTED";
}

export class UpdateLeaveRequestStatusUseCase {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  async execute(dto: UpdateLeaveRequestStatusDTO): Promise<Result<void>> {
    if (!dto.requestId) {
      return Result.fail("Request ID is required");
    }

    if (dto.status !== "APPROVED" && dto.status !== "REJECTED") {
      return Result.fail("Status must be either APPROVED or REJECTED");
    }

    try {
      await this.boardingRepository.updateLeaveRequestStatus(dto.requestId, dto.status);
      return Result.ok();
    } catch (error: any) {
      return Result.fail(error.message || "Failed to update leave request status");
    }
  }
}

