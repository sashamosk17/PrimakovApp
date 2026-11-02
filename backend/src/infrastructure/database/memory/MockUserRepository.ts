import { User } from "../../../domain/entities/User";
import { IUserRepository, UserFilter, PaginatedUsers } from "../../../domain/repositories/IUserRepository";
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
        true,
        undefined,
        "10-А",
        "2010-04-12",
        "+7 (999) 111-22-33",
        "@ivan_petrov_gym"
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
        undefined,
        undefined,
        false,
        undefined,
        "10-А",
        "2010-07-25",
        "+7 (999) 222-33-44",
        "@maria_sokolova_gym"
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
        undefined,
        undefined,
        false,
        undefined,
        "11-Б",
        "2009-11-14",
        "+7 (999) 333-44-55",
        "@aleksei_smirnov_gym"
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
        undefined,
        undefined,
        false,
        undefined,
        "Кафедра математики",
        "1980-05-18",
        "+7 (916) 123-45-67",
        "@ivanov_math"
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
        undefined,
        undefined,
        false,
        undefined,
        "Кафедра словесности",
        "1976-12-03",
        "+7 (916) 234-56-78",
        "@sidorov_lit"
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
        undefined,
        undefined,
        false,
        undefined,
        "Администрация",
        "1985-01-01",
        "+7 (495) 999-00-00",
        "@admin_primakov"
      )
    );
  }

  async findById(id: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.id === id && !u.deletedAt) || null;
    return Result.ok(user);
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    const user = this.users.find((u) => u.email.value === email.toLowerCase() && !u.deletedAt) || null;
    return Result.ok(user);
  }

  async findByRole(role: Role): Promise<Result<User[]>> {
    const users = this.users.filter((u) => u.role === role && u.isActive && !u.deletedAt);
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

  async findAll(filter?: UserFilter): Promise<Result<PaginatedUsers>> {
    let filtered = this.users.filter((u) => !u.deletedAt);

    if (filter?.role) {
      filtered = filtered.filter((u) => u.role === filter.role);
    }
    if (filter?.isActive !== undefined) {
      filtered = filtered.filter((u) => u.isActive === filter.isActive);
    }
    if (filter?.groupName) {
      filtered = filtered.filter((u) => u.groupName === filter.groupName);
    }
    if (filter?.search) {
      const q = filter.search.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.value.toLowerCase().includes(q) ||
          (u.groupName && u.groupName.toLowerCase().includes(q)) ||
          (u.phone && u.phone.includes(q)) ||
          (u.telegram && u.telegram.toLowerCase().includes(q))
      );
    }

    const total = filtered.length;
    const page = Math.max(1, filter?.page || 1);
    const limit = Math.max(1, filter?.limit || 20);
    const totalPages = Math.ceil(total / limit) || 1;
    const offset = (page - 1) * limit;
    const users = filtered.slice(offset, offset + limit);

    return Result.ok({
      users,
      total,
      page,
      limit,
      totalPages,
    });
  }

  async delete(id: string): Promise<Result<void>> {
    const user = this.users.find((u) => u.id === id);
    if (user) {
      user.softDelete();
    }
    return Result.ok();
  }

  async countByRole(): Promise<Result<Record<Role, number>>> {
    const counts: Record<Role, number> = {
      STUDENT: 0,
      TEACHER: 0,
      ADMIN: 0,
      SUPERADMIN: 0,
    };
    for (const u of this.users) {
      if (!u.deletedAt && u.isActive) {
        counts[u.role] = (counts[u.role] || 0) + 1;
      }
    }
    return Result.ok(counts);
  }
}
