import { randomUUID } from "crypto";
import { IUserRepository } from "../repositories/IUserRepository";
import { Email } from "../value-objects/Email";
import { Password } from "../value-objects/Password";
import { Result } from "../../shared/Result";
import { User } from "../entities/User";
import { signToken } from "../../shared/utils/jwt";
import { ROLE_PERMISSIONS } from "../../shared/constants";

export class AuthService {
  constructor(private readonly userRepository: IUserRepository) {}

  public async register(email: string, password: string): Promise<Result<{ user: User; token: string }>> {
    const existing = await this.userRepository.findByEmail(email);
    if (existing.isSuccess && existing.value) {
      return Result.fail("User already exists");
    }

    const emailResult = Email.create(email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error as string);
    }

    const user = new User(
      randomUUID(),
      emailResult.value,
      Password.create(password),
      "",
      "",
      "STUDENT",
      new Date()
    );

    const saveResult = await this.userRepository.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error as string);
    }

    const token = signToken({
      userId: user.id,
      email: user.email.value,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role]
    });

    return Result.ok({ user, token });
  }

  public async login(email: string, password: string): Promise<Result<{ user: User; token: string }>> {
    const userResult = await this.userRepository.findByEmail(email);
    if (userResult.isFailure || !userResult.value) {
      return Result.fail("Invalid credentials");
    }

    const user = userResult.value;
    if (!user.verify(password)) {
      return Result.fail("Invalid credentials");
    }

    user.updateLastLogin();

    const token = signToken({
      userId: user.id,
      email: user.email.value,
      role: user.role,
      permissions: ROLE_PERMISSIONS[user.role]
    });

    return Result.ok({ user, token });
  }
}
