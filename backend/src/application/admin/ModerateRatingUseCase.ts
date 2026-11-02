import { IRatingRepository } from "../../domain/repositories/IRatingRepository";
import { Rating, RatingStatus } from "../../domain/entities/Rating";
import { Result } from "../../shared/Result";

export interface ModerateRatingInput {
  ratingId: string;
  status: RatingStatus;
}

export class ModerateRatingUseCase {
  constructor(private readonly ratingRepo: IRatingRepository) {}

  async execute(input: ModerateRatingInput): Promise<Result<Rating>> {
    let rating: Rating | null = null;

    if (this.ratingRepo.getById) {
      const getRes = await this.ratingRepo.getById(input.ratingId);
      if (getRes.isSuccess) {
        rating = getRes.value;
      }
    }

    if (!rating && this.ratingRepo.getAll) {
      const allRes = await this.ratingRepo.getAll();
      if (allRes.isSuccess && allRes.value) {
        rating = allRes.value.find((r) => r.id === input.ratingId) || null;
      }
    }

    if (!rating) {
      return Result.fail("Rating not found");
    }

    rating.moderate(input.status);

    const updateRes = await this.ratingRepo.update(rating);
    if (updateRes.isFailure) {
      return Result.fail(updateRes.error || "Failed to update rating");
    }

    return Result.ok(rating);
  }
}
