import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { UserSession } from "../../domain/entities/UserSession";
import { Result } from "../../shared/Result";

export class GetUserSessionsUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  public async execute(userId: string, currentSessionId?: string): Promise<Result<UserSession[]>> {
    if (!userId) {
      return Result.fail("User ID is required");
    }

    const result = await this.sessionRepository.findByUserId(userId);
    if (result.isFailure) {
      return Result.fail(result.error as string);
    }

    const sessions = result.value || [];
    if (currentSessionId) {
      sessions.forEach(s => {
        s.isCurrent = (s.id === currentSessionId);
      });
    } else if (sessions.length > 0) {
      // If no currentSessionId provided, the most recently active session is considered current
      sessions[0].isCurrent = true;
    }

    return Result.ok(sessions);
  }
}

