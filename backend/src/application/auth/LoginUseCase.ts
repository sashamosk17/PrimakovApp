import { AuthService } from "../../domain/services/AuthService";
import { Result } from "../../shared/Result";

export class LoginUseCase {
  constructor(private readonly authService: AuthService) {}

  public async execute(email: string, password: string): Promise<Result<{ token: string }>> {
    const result = await this.authService.login(email, password);
    if (result.isFailure) {
      return Result.fail(result.error as string);
    }
    return Result.ok({ user: result.value.user, token: result.value.token } as any);
  }
}
