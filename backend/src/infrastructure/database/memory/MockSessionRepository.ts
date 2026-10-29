import { ISessionRepository } from "../../../domain/repositories/ISessionRepository";
import { UserSession } from "../../../domain/entities/UserSession";
import { Result } from "../../../shared/Result";

export class MockSessionRepository implements ISessionRepository {
  private sessions: UserSession[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    // Seed test sessions for user-1
    this.sessions.push(
      new UserSession(
        "session-1",
        "user-1",
        "iPhone 15 Pro",
        "iOS",
        "185.221.198.10",
        "Москва, Россия",
        new Date(),
        new Date("2026-10-01"),
        true
      ),
      new UserSession(
        "session-2",
        "user-1",
        "MacBook Pro 16",
        "macOS",
        "185.221.198.12",
        "Москва, Россия",
        new Date(Date.now() - 3600000 * 5),
        new Date("2026-09-15"),
        false
      )
    );
  }

  async findByUserId(userId: string): Promise<Result<UserSession[]>> {
    const list = this.sessions
      .filter(s => s.userId === userId)
      .sort((a, b) => b.lastActiveAt.getTime() - a.lastActiveAt.getTime());
    return Result.ok(list);
  }

  async findById(sessionId: string): Promise<Result<UserSession | null>> {
    const session = this.sessions.find(s => s.id === sessionId) || null;
    return Result.ok(session);
  }

  async save(session: UserSession): Promise<Result<void>> {
    const idx = this.sessions.findIndex(s => s.id === session.id);
    if (idx >= 0) {
      this.sessions[idx] = session;
    } else {
      this.sessions.push(session);
    }
    return Result.ok();
  }

  async delete(sessionId: string): Promise<Result<void>> {
    this.sessions = this.sessions.filter(s => s.id !== sessionId);
    return Result.ok();
  }
}

