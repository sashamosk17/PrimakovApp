import { Deadline } from "../entities/Deadline";
import { Result } from "../../shared/Result";

export interface IDeadlineRepository {
  getByUser(userId: string): Promise<Result<Deadline[]>>;
  findById(id: string): Promise<Deadline | undefined>;
  save(deadline: Deadline): Promise<Result<void>>;
  update(deadline: Deadline): Promise<Result<void>>;
}
