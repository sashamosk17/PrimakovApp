import { ISessionRepository } from "../../domain/repositories/ISessionRepository";
import { Result } from "../../shared/Result";

export class RevokeSessionUseCase {
  constructor(private readonly sessionRepository: ISessionRepository) {}

  public async execute(userId: string, sessionId: string): Promise<Result<void>> {
    if (!userId || !sessionId) {
      return Result.fail("User ID and Session ID are required");
    }

    const sessionResult = await this.sessionRepository.findById(sessionId);
    if (sessionResult.isFailure) {
      return Result.fail(sessionResult.error as string);
    }

    const session = sessionResult.value;
    if (!session) {
      return Result.fail("Session not found");
    }

    // Security check: ensure session belongs to user
    if (session.userId !== userId) {
      return Result.fail("Forbidden: Cannot revoke another user's session");
    }

    return await this.sessionRepository.delete(sessionId);
  }
}

