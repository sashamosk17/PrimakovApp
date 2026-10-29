import { User } from "../entities/User";
import { Result } from "../../shared/Result";
import { Role } from "../../shared/types";

export interface IUserRepository {
  findById(id: string): Promise<Result<User | null>>;
  findByEmail(email: string): Promise<Result<User | null>>;
  findByRole(role: Role): Promise<Result<User[]>>;
  save(user: User): Promise<Result<void>>;
}
