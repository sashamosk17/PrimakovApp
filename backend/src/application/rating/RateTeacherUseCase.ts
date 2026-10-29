import { RatingService } from "../../domain/services/RatingService";
import { Rating } from "../../domain/entities/Rating";

export class RateTeacherUseCase {
  constructor(private readonly ratingService: RatingService) {}

  public async execute(rating: Rating) {
    return this.ratingService.rate(rating);
  }
}
