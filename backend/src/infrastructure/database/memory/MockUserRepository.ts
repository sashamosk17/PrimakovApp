import { User } from "../../../domain/entities/User";
import { IUserRepository } from "../../../domain/repositories/IUserRepository";
import { Result } from "../../../shared/Result";
import { Email } from "../../../domain/value-objects/Email";
import { Password } from "../../../domain/value-objects/Password";
import { Role } from "../../../shared/types";

export class MockUserRepository implements IUserRepository {
  private users: User[] = [];

  constructor() {
    this.initializeTestData();
  }

  private initializeTestData(): void {
    const student1Email = Email.create("ivan.petrov@primakov.school").value;
    const student1Pass = Password.create("password123");
    this.users.push(
      new User(
        "user-1",
        student1Email,
        student1Pass,
        "Иван",
        "Петров",
        "STUDENT",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined,
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=250",
        true
      )
    );

    const student2Email = Email.create("maria.sokolova@primakov.school").value;
    const student2Pass = Password.create("password123");
    this.users.push(
      new User(
        "user-2",
        student2Email,
        student2Pass,
        "Мария",
        "Соколова",
        "STUDENT",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined
      )
    );

    const student3Email = Email.create("aleksei.smirnov@primakov.school").value;
    const student3Pass = Password.create("password123");
    this.users.push(
      new User(
        "user-3",
        student3Email,
        student3Pass,
        "Алексей",
        "Смирнов",
        "STUDENT",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined
      )
    );

    // Test teachers
    const teacher1Email = Email.create("teacher.ivanov@primakov.school").value;
    const teacher1Pass = Password.create("password123");
    this.users.push(
      new User(
        "teacher-1",
        teacher1Email,
        teacher1Pass,
        "Иван",
        "Иванов",
        "TEACHER",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined
      )
    );

    const teacher2Email = Email.create("teacher.sidorov@primakov.school").value;
    const teacher2Pass = Password.create("password123");
    this.users.push(
      new User(
        "teacher-2",
        teacher2Email,
        teacher2Pass,
        "Виктор",
        "Сидоров",
        "TEACHER",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined
      )
    );

    // Admin
    const adminEmail = Email.create("admin@primakov.school").value;
    const adminPass = Password.create("password123");
    this.users.push(
      new User(
        "admin-1",
        adminEmail,
        adminPass,
        "Администратор",
        "Примаков",
        "ADMIN",
        new Date("2024-01-01"),
        undefined,
        true,
        undefined
      )
    );
  }

  async findById(id: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.id === id) || null;
    return Result.ok(user);
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.email.value === email.toLowerCase()) || null;
    return Result.ok(user);
  }

  async findByRole(role: Role): Promise<Result<User[]>> {
    const users = this.users.filter((u) => u.role === role && u.isActive);
    return Result.ok(users);
  }

  async save(user: User): Promise<Result<void>> {
    const existingIndex = this.users.findIndex((u) => u.id === user.id);
    if (existingIndex >= 0) {
      this.users[existingIndex] = user;
    } else {
      this.users.push(user);
    }
    return Result.ok();
  }
}
