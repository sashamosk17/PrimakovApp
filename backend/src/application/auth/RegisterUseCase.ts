import { AuthService } from "../../domain/services/AuthService";
import { User } from "../../domain/entities/User";
import { Result } from "../../shared/Result";

export class RegisterUseCase {
  constructor(private readonly authService: AuthService) {}

  public async execute(email: string, password: string): Promise<Result<{ user: User; token: string }>> {
    const result = await this.authService.register(email, password);
    if (result.isFailure) {
      return Result.fail(result.error as string);
    }
    return Result.ok({ user: result.value.user, token: result.value.token });
  }
}
