import { IBoardingRepository, StudentBoardingStatus } from "../../domain/repositories/IBoardingRepository";
import { Result } from "../../shared/Result";

export class GetStudentBoardingStatusUseCase {
  constructor(private readonly boardingRepository: IBoardingRepository) {}

  public async execute(request: { studentId: string }): Promise<Result<StudentBoardingStatus>> {
    try {
      if (!request.studentId) {
        return Result.fail("Student ID is required");
      }

      const status = await this.boardingRepository.getStudentStatus(request.studentId);
      return Result.ok<StudentBoardingStatus>(status);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to retrieve student boarding status");
    }
  }
}

