import { IRatingRepository } from "../repositories/IRatingRepository";
import { Rating } from "../entities/Rating";
import { Result } from "../../shared/Result";

export class RatingService {
  constructor(private readonly ratingRepository: IRatingRepository) {}

  public async rate(rating: Rating): Promise<Result<void>> {
    return this.ratingRepository.save(rating);
  }

  public async getTeacherRatings(teacherId: string): Promise<Result<Rating[]>> {
    return this.ratingRepository.getByTeacher(teacherId);
  }
}
