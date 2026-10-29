import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Result } from "../../shared/Result";

export class GetCurrentUserUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(userId: string): Promise<Result<User>> {
    const result = await this.userRepository.findById(userId);

    if (result.isFailure) {
      return Result.fail(result.error as string);
    }

    if (!result.value) {
      return Result.fail("User not found");
    }

    return Result.ok(result.value);
  }
}