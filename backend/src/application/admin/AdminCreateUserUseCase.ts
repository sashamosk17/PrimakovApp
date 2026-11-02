import crypto from "crypto";
import { User } from "../../domain/entities/User";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { Result } from "../../shared/Result";
import { Role } from "../../shared/types";

export interface CreateUserInput {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: Role;
  isActive?: boolean;
}

export class AdminCreateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: CreateUserInput): Promise<Result<User>> {
    const emailResult = Email.create(input.email);
    if (emailResult.isFailure) {
      return Result.fail(emailResult.error || "Invalid email");
    }

    // Check if user already exists
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing.isSuccess && existing.value) {
      return Result.fail("User with this email already exists");
    }

    let passwordObj: Password;
    try {
      passwordObj = Password.create(input.password);
    } catch (err: any) {
      return Result.fail(err?.message || "Invalid password");
    }

    const id = crypto.randomUUID();
    const user = new User(
      id,
      emailResult.value!,
      passwordObj,
      input.firstName,
      input.lastName,
      input.role,
      new Date(),
      new Date(),
      input.isActive !== undefined ? input.isActive : true
    );

    const saveResult = await this.userRepo.save(user);
    if (saveResult.isFailure) {
      return Result.fail(saveResult.error || "Failed to save user");
    }

    return Result.ok(user);
  }
}
