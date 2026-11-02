import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { MockScheduleRepository } from "../../src/infrastructure/database/memory/MockScheduleRepository";
import { GetUserProfileUseCase } from "../../src/application/user/GetUserProfileUseCase";
import { SearchUsersDirectoryUseCase } from "../../src/application/user/SearchUsersDirectoryUseCase";

describe("User Profile and Campus Directory Use Cases (Strict TDD)", () => {
  let userRepo: MockUserRepository;
  let scheduleRepo: MockScheduleRepository;
  let getUserProfileUseCase: GetUserProfileUseCase;
  let searchDirectoryUseCase: SearchUsersDirectoryUseCase;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    scheduleRepo = new MockScheduleRepository();
    getUserProfileUseCase = new GetUserProfileUseCase(userRepo, scheduleRepo);
    searchDirectoryUseCase = new SearchUsersDirectoryUseCase(userRepo);
  });

  describe("GetUserProfileUseCase", () => {
    it("should return detailed student profile with birthDate, contacts, and today lessons", async () => {
      const result = await getUserProfileUseCase.execute({
        targetUserId: "user-1",
        date: "2026-11-02", // Monday
      });

      expect(result.isSuccess).toBe(true);
      const profile = result.value!;
      expect(profile.id).toBe("user-1");
      expect(profile.firstName).toBe("Иван");
      expect(profile.lastName).toBe("Петров");
      expect(profile.groupName).toBe("10-А");
      expect(profile.birthDate).toBe("2010-04-12");
      expect(profile.phone).toBe("+7 (999) 111-22-33");
      expect(profile.telegram).toBe("@ivan_petrov_gym");
      expect(profile.role).toBe("STUDENT");
      expect(Array.isArray(profile.todayLessons)).toBe(true);
      expect(profile.todayLessons.length).toBeGreaterThan(0);
      expect(profile.todayLessons[0].subject).toBeDefined();
    });

    it("should return teacher profile with department and teacher schedule", async () => {
      const result = await getUserProfileUseCase.execute({
        targetUserId: "teacher-1",
        date: "2026-11-02",
      });

      expect(result.isSuccess).toBe(true);
      const profile = result.value!;
      expect(profile.id).toBe("teacher-1");
      expect(profile.groupName).toBe("Кафедра математики");
      expect(profile.birthDate).toBe("1980-05-18");
      expect(profile.phone).toBe("+7 (916) 123-45-67");
      expect(profile.telegram).toBe("@ivanov_math");
      expect(profile.role).toBe("TEACHER");
    });

    it("should fail gracefully if user is not found", async () => {
      const result = await getUserProfileUseCase.execute({
        targetUserId: "non-existent-user",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toMatch(/не найден|not found/i);
    });
  });

  describe("SearchUsersDirectoryUseCase", () => {
    it("should search users by name query", async () => {
      const result = await searchDirectoryUseCase.execute({
        query: "Иван",
      });

      expect(result.isSuccess).toBe(true);
      const users = result.value!.users;
      expect(users.length).toBeGreaterThan(0);
      expect(users.some((u) => u.firstName === "Иван")).toBe(true);
    });

    it("should filter directory by role", async () => {
      const result = await searchDirectoryUseCase.execute({
        role: "TEACHER",
      });

      expect(result.isSuccess).toBe(true);
      const teachers = result.value!.users;
      expect(teachers.length).toBeGreaterThan(0);
      expect(teachers.every((u) => u.role === "TEACHER")).toBe(true);
    });

    it("should filter directory by class / groupName", async () => {
      const result = await searchDirectoryUseCase.execute({
        groupName: "10-А",
      });

      expect(result.isSuccess).toBe(true);
      const students = result.value!.users;
      expect(students.length).toBeGreaterThan(0);
      expect(students.every((u) => u.groupName === "10-А")).toBe(true);
    });
  });
});

