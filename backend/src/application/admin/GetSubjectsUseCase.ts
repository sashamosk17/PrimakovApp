import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Subject } from "../../domain/entities/Subject";
import { Result } from "../../shared/Result";

export class GetSubjectsUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(): Promise<Result<Subject[]>> {
    return this.subjectRepo.findAll();
  }
}

