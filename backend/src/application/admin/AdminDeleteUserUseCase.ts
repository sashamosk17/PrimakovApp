import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";

export class AdminDeleteUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(id: string): Promise<Result<void>> {
    if (this.userRepo.delete) {
      return this.userRepo.delete(id);
    }

    const userRes = await this.userRepo.findById(id);
    if (userRes.isFailure || !userRes.value) {
      return Result.fail("User not found");
    }

    const user = userRes.value;
    user.softDelete();
    return this.userRepo.save(user);
  }
}

