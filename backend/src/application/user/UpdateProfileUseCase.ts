import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Result } from "../../shared/Result";

export interface UpdateProfileInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  avatarUrl?: string;
  twoFactorEnabled?: boolean;
}

export class UpdateProfileUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(input: UpdateProfileInput): Promise<Result<User>> {
    const { userId, firstName, lastName, avatarUrl, twoFactorEnabled } = input;

    // Проверяем что хотя бы одно поле передано
    if (
      firstName === undefined &&
      lastName === undefined &&
      avatarUrl === undefined &&
      twoFactorEnabled === undefined
    ) {
      return Result.fail("At least one field to update must be provided");
    }

    // Валидация firstName
    if (firstName !== undefined) {
      const trimmed = firstName.trim();
      if (trimmed.length === 0) return Result.fail("First name cannot be empty");
      if (trimmed.length > 50)  return Result.fail("First name must not exceed 50 characters");
    }

    // Валидация lastName
    if (lastName !== undefined) {
      const trimmed = lastName.trim();
      if (trimmed.length === 0) return Result.fail("Last name cannot be empty");
      if (trimmed.length > 50)  return Result.fail("Last name must not exceed 50 characters");
    }

    // Валидация avatarUrl
    if (avatarUrl !== undefined && avatarUrl !== null) {
      if (typeof avatarUrl !== "string") {
        return Result.fail("Avatar URL must be a string");
      }
      if (avatarUrl.length > 200000) {
        return Result.fail("Avatar URL / data too large");
      }
    }

    // Загружаем пользователя
    const userResult = await this.userRepository.findById(userId);
    if (userResult.isFailure) {
      return Result.fail(userResult.error as string);
    }
    if (!userResult.value) {
      return Result.fail("User not found");
    }

    const user = userResult.value;

    // Domain-метод выполняет обновление
    user.updateProfile(
      firstName?.trim(),
      lastName?.trim(),
      avatarUrl,
      twoFactorEnabled
    );

    // Сохраняем через существующий upsert-метод
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error as string);
    }

    return Result.ok(user);
  }
}