/**
 * Integration тесты для AuthService.
 * Проверяем реальное взаимодействие сервиса с MockUserRepository
 * без поднятия HTTP-слоя.
 */
import { AuthService } from "../../src/domain/services/AuthService";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";

function makeAuthService(): { service: AuthService; repo: MockUserRepository } {
  const repo = new MockUserRepository();
  const service = new AuthService(repo);
  return { service, repo };
}

describe("AuthService — login()", () => {
  it("должен вернуть пользователя и JWT-токен при верных данных", async () => {
    const { service } = makeAuthService();

    const result = await service.login("ivan.petrov@primakov.school", "password123");

    expect(result.isSuccess).toBe(true);
    expect(result.value.user).toBeDefined();
    expect(result.value.token).toBeDefined();
    expect(typeof result.value.token).toBe("string");
  });

  it("должен вернуть 'Invalid credentials' для несуществующего пользователя", async () => {
    const { service } = makeAuthService();

    const result = await service.login("ghost@primakov.school", "password123");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Invalid credentials");
  });

  it("должен вернуть 'Invalid credentials' для неверного пароля", async () => {
    const { service } = makeAuthService();

    const result = await service.login("ivan.petrov@primakov.school", "WRONG");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("Invalid credentials");
  });

  it("должен вернуть роль TEACHER для учителя", async () => {
    const { service } = makeAuthService();

    const result = await service.login("teacher.ivanov@primakov.school", "password123");

    expect(result.isSuccess).toBe(true);
    expect(result.value.user.role).toBe("TEACHER");
  });

  it("должен вернуть роль ADMIN для администратора", async () => {
    const { service } = makeAuthService();

    const result = await service.login("admin@primakov.school", "password123");

    expect(result.isSuccess).toBe(true);
    expect(result.value.user.role).toBe("ADMIN");
  });

  it("должен обновить updatedAt пользователя после логина", async () => {
    const { service, repo } = makeAuthService();
    const before = Date.now();

    await service.login("ivan.petrov@primakov.school", "password123");

    const userResult = await repo.findByEmail("ivan.petrov@primakov.school");
    expect(userResult.isSuccess).toBe(true);
    expect(userResult.value!.updatedAt.getTime()).toBeGreaterThanOrEqual(before);
  });
});

describe("AuthService — register()", () => {
  it("должен успешно зарегистрировать нового пользователя", async () => {
    const { service } = makeAuthService();

    const result = await service.register("newstudent@primakov.school", "password123");

    expect(result.isSuccess).toBe(true);
    expect(result.value.user).toBeDefined();
    expect(result.value.token).toBeDefined();
  });

  it("новый пользователь должен иметь роль STUDENT по умолчанию", async () => {
    const { service } = makeAuthService();

    const result = await service.register("newstudent@primakov.school", "password123");

    expect(result.value.user.role).toBe("STUDENT");
  });

  it("должен вернуть 'User already exists' при регистрации с занятым email", async () => {
    const { service } = makeAuthService();

    const result = await service.register("ivan.petrov@primakov.school", "password123");

    expect(result.isFailure).toBe(true);
    expect(result.error).toBe("User already exists");
  });

  it("должен вернуть ошибку для невалидного email", async () => {
    const { service } = makeAuthService();

    const result = await service.register("not-an-email", "password123");

    expect(result.isFailure).toBe(true);
  });

  it("после регистрации должна быть возможность войти с теми же данными", async () => {
    const { service } = makeAuthService();
    const email = "freshuser@school.ru";
    const password = "freshpassword123";

    await service.register(email, password);
    const loginResult = await service.login(email, password);

    expect(loginResult.isSuccess).toBe(true);
    expect(loginResult.value.user.email.value).toBe(email);
  });

  it("email нового пользователя должен быть сохранён в нижнем регистре", async () => {
    const { service } = makeAuthService();

    const result = await service.register("NewUser@SCHOOL.RU", "password123");

    expect(result.isSuccess).toBe(true);
    expect(result.value.user.email.value).toBe("newuser@school.ru");
  });
});
