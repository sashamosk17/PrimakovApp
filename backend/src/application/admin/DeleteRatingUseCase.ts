import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { Result } from "../../shared/Result";

export class DeleteRatingUseCase {
  constructor(private readonly ratingRepo: IRatingRepository) {}

  async execute(ratingId: string): Promise<Result<void>> {
    if (this.ratingRepo.delete) {
      return this.ratingRepo.delete(ratingId);
    }
    return Result.fail("Delete operation not supported");
  }
}

