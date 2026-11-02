import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Result } from "../../shared/Result";

export class DeleteSubjectUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(id: string): Promise<Result<void>> {
    if (!id) {
      return Result.fail("Subject ID is required");
    }
    return this.subjectRepo.delete(id);
  }
}

