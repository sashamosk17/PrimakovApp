import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Result } from "../../shared/Result";

export interface RemoveTeacherSubjectInput {
  teacherId: string;
  subjectId: string;
}

export class RemoveTeacherSubjectUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(input: RemoveTeacherSubjectInput): Promise<Result<void>> {
    if (!input.teacherId || !input.subjectId) {
      return Result.fail("Teacher ID and Subject ID are required");
    }
    return this.subjectRepo.removeTeacherSubject(input.teacherId, input.subjectId);
  }
}

