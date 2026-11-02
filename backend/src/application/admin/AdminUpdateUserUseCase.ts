import { IUserRepository } from "../../domain/repositories/IUserRepository";
import { User } from "../../domain/entities/User";
import { Result } from "../../shared/Result";
import { Email } from "../../domain/value-objects/Email";
import { Password } from "../../domain/value-objects/Password";
import { Role } from "../../shared/types";

export interface AdminUpdateUserInput {
  userId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  role?: Role;
  groupName?: string;
  isActive?: boolean;
  newPassword?: string;
  birthDate?: string;
  phone?: string;
  telegram?: string;
}

export class AdminUpdateUserUseCase {
  constructor(private readonly userRepo: IUserRepository) {}

  async execute(input: AdminUpdateUserInput): Promise<Result<User>> {
    const userRes = await this.userRepo.findById(input.userId);
    if (userRes.isFailure || !userRes.value) {
      return Result.fail("User not found");
    }

    const user = userRes.value;

    if (input.email) {
      const emailResult = Email.create(input.email);
      if (emailResult.isFailure) {
        return Result.fail(emailResult.error || "Invalid email format");
      }
      user.email = emailResult.value;
    }

    if (input.firstName !== undefined) {
      user.firstName = input.firstName;
    }

    if (input.lastName !== undefined) {
      user.lastName = input.lastName;
    }

    if (input.role !== undefined) {
      user.role = input.role;
    }

    if (input.groupName !== undefined) {
      user.groupName = input.groupName;
    }

    if (input.isActive !== undefined) {
      user.isActive = input.isActive;
    }

    if (input.birthDate !== undefined) {
      user.birthDate = input.birthDate;
    }

    if (input.phone !== undefined) {
      user.phone = input.phone;
    }

    if (input.telegram !== undefined) {
      user.telegram = input.telegram;
    }

    if (input.newPassword) {
      const pass = Password.create(input.newPassword);
      user.changePassword(pass);
    }

    user.updatedAt = new Date();

    const saveRes = await this.userRepo.save(user);
    if (saveRes.isFailure) {
      return Result.fail(saveRes.error || "Failed to update user");
    }

    return Result.ok(user);
  }
}
