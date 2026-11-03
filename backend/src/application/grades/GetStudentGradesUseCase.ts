import { SubjectGradeSummary } from "../../domain/entities/SubjectGradeSummary";
import { IGradeRepository } from "../../domain/repositories/IGradeRepository";
import { Result } from "../../shared/Result";

export interface GetStudentGradesRequest {
  studentId: string;
  period?: string;
}

export class GetStudentGradesUseCase {
  constructor(private readonly gradeRepository: IGradeRepository) {}

  public async execute(
    request: GetStudentGradesRequest
  ): Promise<Result<SubjectGradeSummary[]>> {
    try {
      if (!request.studentId) {
        return Result.fail("Student ID is required");
      }

      const summaries = await this.gradeRepository.getStudentSummary(
        request.studentId,
        request.period
      );

      return Result.ok<SubjectGradeSummary[]>(summaries);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to retrieve student grades");
    }
  }
}

