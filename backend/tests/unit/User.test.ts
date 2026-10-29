import { User } from "../../src/domain/entities/User";
import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";

function makeUser(overrides: Partial<{
  role: "STUDENT" | "TEACHER" | "ADMIN" | "SUPERADMIN";
  firstName: string;
  lastName: string;
  isActive: boolean;
}> = {}): User {
  const email = Email.create("test@primakov.school").value;
  const password = Password.create("password123");

  return new User(
    "user-test-1",
    email,
    password,
    overrides.firstName ?? "Иван",
    overrides.lastName ?? "Петров",
    overrides.role ?? "STUDENT",
    new Date(),
    undefined,
    overrides.isActive ?? true
  );
}

describe("User Entity", () => {
  describe("isStudent() / isTeacher() / isAdmin()", () => {
    it("isStudent() должен возвращать true для роли STUDENT", () => {
      const user = makeUser({ role: "STUDENT" });
      expect(user.isStudent()).toBe(true);
      expect(user.isTeacher()).toBe(false);
      expect(user.isAdmin()).toBe(false);
    });

    it("isTeacher() должен возвращать true для роли TEACHER", () => {
      const user = makeUser({ role: "TEACHER" });
      expect(user.isTeacher()).toBe(true);
      expect(user.isStudent()).toBe(false);
      expect(user.isAdmin()).toBe(false);
    });

    it("isAdmin() должен возвращать true для роли ADMIN", () => {
      const user = makeUser({ role: "ADMIN" });
      expect(user.isAdmin()).toBe(true);
      expect(user.isStudent()).toBe(false);
      expect(user.isTeacher()).toBe(false);
    });

    it("isAdmin() должен возвращать true для роли SUPERADMIN", () => {
      const user = makeUser({ role: "SUPERADMIN" });
      expect(user.isAdmin()).toBe(true);
    });
  });

  describe("hasPermission()", () => {
    it("STUDENT должен иметь разрешение deadline:create", () => {
      const user = makeUser({ role: "STUDENT" });
      expect(user.hasPermission("deadline:create")).toBe(true);
    });

    it("STUDENT не должен иметь разрешение users:delete", () => {
      const user = makeUser({ role: "STUDENT" });
      expect(user.hasPermission("users:delete")).toBe(false);
    });

    it("ADMIN должен иметь разрешение users:delete", () => {
      const user = makeUser({ role: "ADMIN" });
      expect(user.hasPermission("users:delete")).toBe(true);
    });

    it("TEACHER не должен иметь разрешение deadline:create", () => {
      const user = makeUser({ role: "TEACHER" });
      expect(user.hasPermission("deadline:create")).toBe(false);
    });

    it("STUDENT должен иметь разрешение rating:create", () => {
      const user = makeUser({ role: "STUDENT" });
      expect(user.hasPermission("rating:create")).toBe(true);
    });
  });

  describe("verify()", () => {
    it("должен вернуть true для правильного пароля", () => {
      const user = makeUser();
      expect(user.verify("password123")).toBe(true);
    });

    it("должен вернуть false для неправильного пароля", () => {
      const user = makeUser();
      expect(user.verify("wrongpassword")).toBe(false);
    });

    it("должен быть чувствителен к регистру", () => {
      const user = makeUser();
      expect(user.verify("Password123")).toBe(false);
    });
  });

  describe("updateLastLogin()", () => {
    it("должен обновить updatedAt", () => {
      const user = makeUser();
      const oldUpdatedAt = user.updatedAt.getTime();
      // Небольшая задержка чтобы время изменилось
      const later = new Date(Date.now() + 100);
      user.updatedAt = new Date(oldUpdatedAt - 1000); // делаем updatedAt в прошлом

      user.updateLastLogin();

      expect(user.updatedAt.getTime()).toBeGreaterThan(oldUpdatedAt - 1000);
    });
  });

  describe("toJSON()", () => {
    it("должен не включать хеш пароля в сериализацию", () => {
      const user = makeUser();
      const json = user.toJSON();

      expect(json).not.toHaveProperty("password");
      expect(json).toHaveProperty("email");
      expect(json).toHaveProperty("role");
    });

    it("должен содержать все основные поля", () => {
      const user = makeUser({ firstName: "Мария", lastName: "Иванова", role: "TEACHER" });
      const json = user.toJSON();

      expect(json.email).toBe("test@primakov.school");
      expect(json.firstName).toBe("Мария");
      expect(json.lastName).toBe("Иванова");
      expect(json.role).toBe("TEACHER");
      expect(json.isActive).toBe(true);
    });

    it("createdAt и updatedAt должны быть строками ISO", () => {
      const user = makeUser();
      const json = user.toJSON();

      expect(typeof json.createdAt).toBe("string");
      expect(typeof json.updatedAt).toBe("string");
      expect(() => new Date(json.createdAt)).not.toThrow();
    });
  });
});
