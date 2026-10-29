/**
 * API тесты для /api/deadlines + authMiddleware.
 * Покрываем: GET (без токена / с токеном), POST создание,
 * PATCH complete/uncomplete, 404 для несуществующего id,
 * а также поведение authMiddleware на защищённых маршрутах.
 */
import request from "supertest";
import express from "express";
import { deadlineRoutes } from "../../src/presentation/routes/deadlineRoutes";
import { authRoutes } from "../../src/presentation/routes/authRoutes";
import { MockDeadlineRepository } from "../../src/infrastructure/database/mock/MockDeadlineRepository";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const deadlineRepo = new MockDeadlineRepository();
  const userRepo = new MockUserRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes(userRepo));
  app.use("/api/deadlines", deadlineRoutes(deadlineRepo));
  app.use(errorHandlerMiddleware);
  return { app, deadlineRepo };
}

// Хелпер: получить токен через логин
async function getToken(
  app: express.Express,
  email = "ivan.petrov@primakov.school",
  password = "password123"
): Promise<string> {
  const res = await request(app)
    .post("/api/auth/login")
    .send({ email, password });
  return res.body.data.token as string;
}

// ───────────────────────────────────────────
// GET /api/deadlines
// ───────────────────────────────────────────
describe("GET /api/deadlines", () => {
  it("200 и массив дедлайнов (fallback userId=user-1 без токена)", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/deadlines");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("у каждого дедлайна есть обязательные поля", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/deadlines");

    res.body.data.forEach((d: any) => {
      expect(d.id).toBeDefined();
      expect(d.title).toBeDefined();
      expect(d.dueDate).toBeDefined();
      expect(d.status).toBeDefined();
    });
  });

  it("с токеном возвращает дедлайны авторизованного пользователя", async () => {
    const { app } = createApp();
    const token = await getToken(app);

    const res = await request(app)
      .get("/api/deadlines")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

// ───────────────────────────────────────────
// POST /api/deadlines
// ───────────────────────────────────────────
describe("POST /api/deadlines", () => {
  it("201 при создании корректного дедлайна", async () => {
    const { app } = createApp();
    const dueDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/api/deadlines")
      .send({
        title: "Новый тестовый дедлайн",
        description: "Описание",
        dueDate,
        subject: "Физика",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe("Новый тестовый дедлайн");
  });

  it("созданный дедлайн имеет статус PENDING", async () => {
    const { app } = createApp();
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/api/deadlines")
      .send({ title: "Дедлайн", description: "Описание", dueDate });

    expect(res.body.data.status).toBe("PENDING");
  });

  it("созданный дедлайн содержит переданный предмет", async () => {
    const { app } = createApp();
    const dueDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();

    const res = await request(app)
      .post("/api/deadlines")
      .send({ title: "Тест", description: "Описание", dueDate, subject: "Химия" });

    expect(res.body.data.subject).toBe("Химия");
  });

  it("после создания дедлайн появляется в GET /api/deadlines", async () => {
    const { app } = createApp();
    const dueDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
    const title = "Уникальный заголовок XYZ";

    await request(app)
      .post("/api/deadlines")
      .send({ title, description: "описание", dueDate, userId: "user-1" });

    const getRes = await request(app).get("/api/deadlines");
    const titles = getRes.body.data.map((d: any) => d.title);
    expect(titles).toContain(title);
  });
});

// ───────────────────────────────────────────
// PATCH /api/deadlines/:id/complete
// ───────────────────────────────────────────
describe("PATCH /api/deadlines/:deadlineId/complete", () => {
  it("200 и статус COMPLETED после завершения дедлайна", async () => {
    const { app, deadlineRepo } = createApp();
    // Берём первый дедлайн из тестовых данных (userId = user-1, статус PENDING)
    const allResult = await deadlineRepo.getByUser("user-1");
    const pending = allResult.value?.find((d: any) => d.status === "PENDING");
    if (!pending) throw new Error("Нет pending дедлайна в тестовых данных");

    const res = await request(app)
      .patch(`/api/deadlines/${pending.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.status).toBe("COMPLETED");
  });

  it("повторный PATCH меняет статус обратно на PENDING (toggle)", async () => {
    const { app, deadlineRepo } = createApp();
    const allResult = await deadlineRepo.getByUser("user-1");
    const pending = allResult.value?.find((d: any) => d.status === "PENDING");
    if (!pending) throw new Error("Нет pending дедлайна");

    // Завершаем
    await request(app).patch(`/api/deadlines/${pending.id}/complete`);

    // Снова нажимаем — uncomplete
    const res = await request(app).patch(`/api/deadlines/${pending.id}/complete`);

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe("PENDING");
  });

  it("404 для несуществующего deadlineId", async () => {
    const { app } = createApp();

    const res = await request(app)
      .patch("/api/deadlines/non-existent-id/complete");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Deadline not found");
  });
});

// ───────────────────────────────────────────
// authMiddleware — защита маршрутов
// ───────────────────────────────────────────
describe("authMiddleware", () => {
  // Создаём приложение с защищённым маршрутом для тестирования middleware
  function createProtectedApp() {
    const app = express();
    app.use(express.json());

    const { authMiddleware } = require("../../src/presentation/middleware/authMiddleware");

    app.get("/protected", authMiddleware, (_req: any, res: any) => {
      res.json({ status: "success", userId: _req.user.userId });
    });
    app.use(errorHandlerMiddleware);
    return app;
  }

  it("401 если токен не передан", async () => {
    const app = createProtectedApp();
    const res = await request(app).get("/protected");

    expect(res.status).toBe(401);
  });

  it("401 если передан некорректный токен", async () => {
    const app = createProtectedApp();
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer this.is.not.a.token");

    expect(res.status).toBe(401);
  });

  it("401 если заголовок Authorization без Bearer", async () => {
    const app = createProtectedApp();
    const token = signToken({ userId: "user-1", email: "ivan.petrov@primakov.school", role: "STUDENT", permissions: [] });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", token); // без "Bearer "

    expect(res.status).toBe(401);
  });

  it("200 с валидным JWT токеном", async () => {
    const app = createProtectedApp();
    const token = signToken({ userId: "user-1", email: "ivan.petrov@primakov.school", role: "STUDENT", permissions: [] });

    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.userId).toBe("user-1");
  });
});
