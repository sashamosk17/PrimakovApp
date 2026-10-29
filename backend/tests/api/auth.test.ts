/**
 * API тесты для /api/auth — login и register.
 * Используем supertest + MockUserRepository (без реальной БД).
 */
import request from "supertest";
import express from "express";
import { authRoutes } from "../../src/presentation/routes/authRoutes";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";

function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes(new MockUserRepository()));
  app.use(errorHandlerMiddleware);
  return app;
}

// ───────────────────────────────────────────
// POST /api/auth/login
// ───────────────────────────────────────────
describe("POST /api/auth/login", () => {
  const app = createApp();

  it("200 + токен при верных данных", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ivan.petrov@primakov.school", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(typeof res.body.data.token).toBe("string");
    expect(res.body.data.token.length).toBeGreaterThan(0);
  });

  it("ответ содержит email пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ivan.petrov@primakov.school", password: "password123" });

    expect(res.body.data.user.email).toBe("ivan.petrov@primakov.school");
  });

  it("ответ содержит роль пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ivan.petrov@primakov.school", password: "password123" });

    expect(res.body.data.user.role).toBe("STUDENT");
  });

  it("401 при неверном пароле", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "ivan.petrov@primakov.school", password: "wrongpassword" });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBeDefined();
  });

  it("401 для несуществующего пользователя", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "nobody@primakov.school", password: "password123" });

    expect(res.status).toBe(401);
    expect(res.body.status).toBe("error");
  });

  it("401 для невалидного формата email", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "notanemail", password: "password123" });

    expect(res.status).toBe(401);
  });

  it("200 для учителя с ролью TEACHER", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "teacher.ivanov@primakov.school", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("TEACHER");
  });

  it("200 для администратора с ролью ADMIN", async () => {
    const res = await request(app)
      .post("/api/auth/login")
      .send({ email: "admin@primakov.school", password: "password123" });

    expect(res.status).toBe(200);
    expect(res.body.data.user.role).toBe("ADMIN");
  });
});

// ───────────────────────────────────────────
// POST /api/auth/register
// ───────────────────────────────────────────
describe("POST /api/auth/register", () => {
  // Каждый тест получает чистый app с пустым репозиторием
  it("201 + токен при регистрации нового пользователя", async () => {
    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ email: "brand.new@primakov.school", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(typeof res.body.data.token).toBe("string");
  });

  it("новый пользователь имеет роль STUDENT", async () => {
    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ email: "student.new@primakov.school", password: "password123" });

    expect(res.status).toBe(201);
    expect(res.body.data.user.role).toBe("STUDENT");
  });

  it("400 при регистрации с уже занятым email", async () => {
    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ email: "ivan.petrov@primakov.school", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("User already exists");
  });

  it("400 при невалидном email", async () => {
    const res = await request(createApp())
      .post("/api/auth/register")
      .send({ email: "bad-email", password: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("после регистрации можно войти с теми же данными", async () => {
    const app = createApp();
    const email = "register.then.login@school.ru";
    const password = "testpassword456";

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({ email, password });
    expect(registerRes.status).toBe(201);

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email, password });
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.data.user.email).toBe(email);
  });

  it("повторная регистрация того же email даёт 400", async () => {
    const app = createApp();
    const email = "twice@primakov.school";

    await request(app).post("/api/auth/register").send({ email, password: "pass1" });
    const res2 = await request(app).post("/api/auth/register").send({ email, password: "pass2" });

    expect(res2.status).toBe(400);
    expect(res2.body.error.message).toBe("User already exists");
  });
});
