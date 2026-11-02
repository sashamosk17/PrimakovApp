import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Result } from "../../shared/Result";

export class AdminUpdateUserStatusUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(id: string, isActive: boolean): Promise<Result<User>> {
    const userRes = await this.userRepo.findById(id);
    if (userRes.isFailure || !userRes.value) {
      return Result.fail("User not found");
    }

    const user = userRes.value;
    user.toggleActive(isActive);

    const saveRes = await this.userRepo.save(user);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to update user");
    }

    return Result.ok(user);
  }
}
