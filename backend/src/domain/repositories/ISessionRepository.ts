import { UserSession } from "../entities/UserSession";
import { Result } from "../../shared/Result";

export interface ISessionRepository {
  findByUserId(userId: string): Promise<Result<UserSession[]>>;
  findById(sessionId: string): Promise<Result<UserSession | null>>;
  save(session: UserSession): Promise<Result<void>>;
  delete(sessionId: string): Promise<Result<void>>;
}

