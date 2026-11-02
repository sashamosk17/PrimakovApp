import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { AdminUpdateUserUseCase } from "../../src/application/admin/AdminUpdateUserUseCase";
import { Password } from "../../src/domain/value-objects/Password";

describe("AdminUpdateUserUseCase", () => {
  let userRepo: MockUserRepository;
  let useCase: AdminUpdateUserUseCase;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    useCase = new AdminUpdateUserUseCase(userRepo);
  });

  it("should successfully update user personal details and class (groupName)", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      firstName: "Иван-Обновленный",
      lastName: "Петров-Смирнов",
      groupName: "11-Б",
      role: "STUDENT",
    });

    expect(result.isSuccess).toBe(true);
    const updated = result.value;
    expect(updated.firstName).toBe("Иван-Обновленный");
    expect(updated.lastName).toBe("Петров-Смирнов");
    expect(updated.groupName).toBe("11-Б");

    // Verify persisted in repo
    const fetched = await userRepo.findById("user-1");
    expect(fetched.value?.firstName).toBe("Иван-Обновленный");
    expect(fetched.value?.groupName).toBe("11-Б");
  });

  it("should reset user password when newPassword is provided", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      newPassword: "NewSecurePassword123!",
    });

    expect(result.isSuccess).toBe(true);

    const fetched = await userRepo.findById("user-1");
    expect(fetched.value?.verify("NewSecurePassword123!")).toBe(true);
  });

  it("should fail if user is not found", async () => {
    const result = await useCase.execute({
      userId: "non-existent-id",
      firstName: "Тест",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/not found/i);
  });

  it("should fail if invalid email is provided", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      email: "invalid-email-address",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/email/i);
  });

  it("should successfully update user birthDate, phone, and telegram", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      birthDate: "2008-09-12",
      phone: "+7 (999) 777-66-55",
      telegram: "@primakov_star",
    });

    expect(result.isSuccess).toBe(true);
    const updated = result.value;
    expect(updated.birthDate).toBe("2008-09-12");
    expect(updated.phone).toBe("+7 (999) 777-66-55");
    expect(updated.telegram).toBe("@primakov_star");

    const fetched = await userRepo.findById("user-1");
    expect(fetched.value?.birthDate).toBe("2008-09-12");
    expect(fetched.value?.phone).toBe("+7 (999) 777-66-55");
    expect(fetched.value?.telegram).toBe("@primakov_star");
  });
});

