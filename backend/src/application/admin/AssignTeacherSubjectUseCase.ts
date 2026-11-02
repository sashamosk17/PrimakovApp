import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Result } from "../../shared/Result";

export interface AssignTeacherSubjectInput {
  teacherId: string;
  subjectId: string;
}

export class AssignTeacherSubjectUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(input: AssignTeacherSubjectInput): Promise<Result<void>> {
    if (!input.teacherId) {
      return Result.fail("Teacher ID is required");
    }
    if (!input.subjectId) {
      return Result.fail("Subject ID is required");
    }
    return this.subjectRepo.assignTeacherSubject(input.teacherId, input.subjectId);
  }
}

