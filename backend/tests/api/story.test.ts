import request from "supertest";
import express from "express";
import { storyRoutes } from "../../src/presentation/routes/storyRoutes";
import { MockStoryRepository } from "../../src/infrastructure/database/mock/MockStoryRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const repo = new MockStoryRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/stories", storyRoutes(repo));
  app.use(errorHandlerMiddleware);
  return { app, repo };
}

describe("GET /api/stories", () => {
  it("200 и массив активных сторис", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/stories");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("title");
  });
});

describe("POST /api/stories/:storyId/view", () => {
  it("200 при отметке сторис как просмотренной", async () => {
    const { app } = createApp();
    const token = signToken({
      userId: "user-1",
      email: "ivan.petrov@primakov.school",
      role: "STUDENT",
      permissions: [],
    });

    const res = await request(app)
      .post("/api/stories/story-3/view")
      .set("Authorization", `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

describe("Admin Story Management (POST, PUT, DELETE)", () => {
  const adminToken = signToken({
    userId: "admin-1",
    email: "admin@primakov.school",
    role: "ADMIN",
    permissions: [],
  });

  const studentToken = signToken({
    userId: "student-1",
    email: "student@primakov.school",
    role: "STUDENT",
    permissions: [],
  });

  it("admin can create story with link and description", async () => {
    const { app } = createApp();
    const res = await request(app)
      .post("/api/stories")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Гимназический бал",
        description: "Дресс-код: black tie. Начало в 18:00.",
        imageUrl: "https://primakov.school/ball.jpg",
        linkUrl: "https://primakov.school/events/ball",
        linkText: "Купить билет",
        expiresInDays: 7,
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.title).toBe("Гимназический бал");
    expect(res.body.data.linkText).toBe("Купить билет");
  });

  it("student cannot create story (403)", async () => {
    const { app } = createApp();
    const res = await request(app)
      .post("/api/stories")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        title: "Хакерская история",
        description: "Тест",
      });

    expect(res.status).toBe(403);
  });

  it("admin can update story", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/stories/story-1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        title: "Обновленный День открытых дверей",
        linkText: "Новая ссылка",
      });

    expect(res.status).toBe(200);
    expect(res.body.data.title).toBe("Обновленный День открытых дверей");
  });

  it("admin can delete story", async () => {
    const { app } = createApp();
    const res = await request(app)
      .delete("/api/stories/story-1")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

