import { Rating } from "../entities/Rating";
import { Result } from "../../shared/Result";

export interface IRatingRepository {
  getByTeacher(teacherId: string): Promise<Result<Rating[]>>;
  save(rating: Rating): Promise<Result<void>>;
  update(rating: Rating): Promise<Result<void>>;
}
