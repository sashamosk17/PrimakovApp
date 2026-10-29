import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Password } from "../../domain/value-objects/Password";
import { Result } from "../../shared/Result";

export interface ChangePasswordInput {
  userId: string;
  currentPassword: string;
  newPassword: string;
}

const MIN_PASSWORD_LENGTH = 8;
const MAX_PASSWORD_LENGTH = 100;

export class ChangePasswordUseCase {
  constructor(private readonly userRepository: IUserRepository) {}

  public async execute(input: ChangePasswordInput): Promise<Result<void>> {
    const { userId, currentPassword, newPassword } = input;

    // Валидация нового пароля (Password.create() не валидирует — делаем здесь)
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      return Result.fail(`New password must be at least ${MIN_PASSWORD_LENGTH} characters`);
    }
    if (newPassword.length > MAX_PASSWORD_LENGTH) {
      return Result.fail("New password is too long");
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

    // Проверяем текущий пароль через User.verify() (использует bcrypt compareSync)
    if (!user.verify(currentPassword)) {
      return Result.fail("Current password is incorrect");
    }

    // Запрещаем установку того же пароля
    if (user.verify(newPassword)) {
      return Result.fail("New password must be different from the current password");
    }

    // Создаём новый хеш и обновляем через domain-метод
    user.changePassword(Password.create(newPassword));

    // Сохраняем — PostgresUserRepository.save() обновляет password_hash
    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error as string);
    }

    return Result.ok();
  }
}