import { AdminCreateUserUseCase, CreateUserInput } from "./AdminCreateUserUseCase";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";

export interface BatchImportResult {
  importedCount: number;
  failedCount: number;
  errors: Array<{ email: string; error: string }>;
}

export class AdminBatchImportUsersUseCase {
  private createUserUseCase: AdminCreateUserUseCase;

  constructor(userRepo: IUserRepository) {
    this.createUserUseCase = new AdminCreateUserUseCase(userRepo);
  }

  async execute(users: CreateUserInput[]): Promise<Result<BatchImportResult>> {
    let importedCount = 0;
    let failedCount = 0;
    const errors: Array<{ email: string; error: string }> = [];

    for (const u of users) {
      const res = await this.createUserUseCase.execute(u);
      if (res.isSuccess) {
        importedCount++;
      } else {
        failedCount++;
        errors.push({
          email: u.email,
          error: res.error || "Failed to create user",
        });
      }
    }

    return Result.ok({
      importedCount,
      failedCount,
      errors,
    });
  }
}

