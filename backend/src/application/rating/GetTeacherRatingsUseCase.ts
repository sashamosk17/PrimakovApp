import { RatingService } from "../../domain/services/RatingService";

export class GetTeacherRatingsUseCase {
  constructor(private readonly ratingService: RatingService) {}

  public async execute(teacherId: string) {
    return this.ratingService.getTeacherRatings(teacherId);
  }
}
