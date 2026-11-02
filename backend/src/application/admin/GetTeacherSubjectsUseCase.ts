import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Subject } from "../../domain/entities/Subject";
import { Result } from "../../shared/Result";

export class GetTeacherSubjectsUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(teacherId: string): Promise<Result<Subject[]>> {
    if (!teacherId) {
      return Result.fail("Teacher ID is required");
    }
    return this.subjectRepo.getTeacherSubjects(teacherId);
  }
}

