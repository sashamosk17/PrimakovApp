import { IRatingRepository } from "../../../domain/repositories/IRatingRepository";
import { Rating } from "../../../domain/entities/Rating";
import { Result } from "../../../shared/Result";

export class MockRatingRepository implements IRatingRepository {
  private ratings: Rating[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const now = new Date();
    this.ratings.push(
      new Rating("rating-1", "teacher-1", "user-1", 9, now, "Отличный преподаватель!"),
      new Rating("rating-2", "teacher-1", "user-2", 10, now, "Очень понятно объясняет материал"),
      new Rating("rating-3", "teacher-2", "user-1", 8, now, "Хорошие уроки"),
      new Rating("rating-4", "teacher-2", "user-3", 9, now, "Интересные задания")
    );
  }

  async getByTeacher(teacherId: string): Promise<Result<Rating[]>> {
    return Result.ok(this.ratings.filter((r) => r.teacherId === teacherId));
  }

  async save(rating: Rating): Promise<Result<void>> {
    this.ratings.push(rating);
    return Result.ok();
  }

  async update(rating: Rating): Promise<Result<void>> {
    const index = this.ratings.findIndex((r) => r.id === rating.id);
    if (index >= 0) {
      this.ratings[index] = rating;
    }
    return Result.ok();
  }
}
