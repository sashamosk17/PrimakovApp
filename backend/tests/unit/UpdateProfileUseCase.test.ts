import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { UpdateProfileUseCase } from "../../src/application/user/UpdateProfileUseCase";

describe("UpdateProfileUseCase", () => {
  let userRepo: MockUserRepository;
  let useCase: UpdateProfileUseCase;

  beforeEach(() => {
    userRepo = new MockUserRepository();
    useCase = new UpdateProfileUseCase(userRepo);
  });

  it("should successfully update first and last name", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      firstName: "Александр",
      lastName: "Иванов",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.firstName).toBe("Александр");
    expect(result.value.lastName).toBe("Иванов");

    const fetched = await userRepo.findById("user-1");
    expect(fetched.value?.firstName).toBe("Александр");
  });

  it("should successfully update birthDate, phone, and telegram", async () => {
    const result = await useCase.execute({
      userId: "user-1",
      birthDate: "2009-05-20",
      phone: "+7 (999) 333-22-11",
      telegram: "@alex_ivanov",
    });

    expect(result.isSuccess).toBe(true);
    expect(result.value.birthDate).toBe("2009-05-20");
    expect(result.value.phone).toBe("+7 (999) 333-22-11");
    expect(result.value.telegram).toBe("@alex_ivanov");

    const fetched = await userRepo.findById("user-1");
    expect(fetched.value?.birthDate).toBe("2009-05-20");
    expect(fetched.value?.phone).toBe("+7 (999) 333-22-11");
    expect(fetched.value?.telegram).toBe("@alex_ivanov");
  });

  it("should fail if no update fields are provided", async () => {
    const result = await useCase.execute({
      userId: "user-1",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/at least one field/i);
  });

  it("should fail if user does not exist", async () => {
    const result = await useCase.execute({
      userId: "non-existent-user",
      firstName: "Test",
    });

    expect(result.isFailure).toBe(true);
    expect(result.error).toMatch(/not found/i);
  });
});

