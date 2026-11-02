import { randomUUID } from "crypto";
import { ISubjectRepository } from "../../domain/repositories/ISubjectRepository";
import { Subject } from "../../domain/entities/Subject";
import { Result } from "../../shared/Result";

export interface CreateSubjectInput {
  name: string;
  description?: string;
}

export class CreateSubjectUseCase {
  constructor(private readonly subjectRepo: ISubjectRepository) {}

  async execute(input: CreateSubjectInput): Promise<Result<Subject>> {
    const trimmed = input.name?.trim();
    if (!trimmed) {
      return Result.fail("Subject name cannot be empty");
    }

    const subject = new Subject(
      randomUUID(),
      trimmed,
      input.description?.trim(),
      new Date(),
      new Date()
    );

    return this.subjectRepo.create(subject);
  }
}

