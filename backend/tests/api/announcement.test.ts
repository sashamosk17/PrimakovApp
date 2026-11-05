import request from "supertest";
import express from "express";
import { announcementRoutes } from "../../src/presentation/routes/announcementRoutes";
import { MockAnnouncementRepository } from "../../src/infrastructure/database/mock/MockAnnouncementRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";

function createApp() {
  const repo = new MockAnnouncementRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/announcements", announcementRoutes(repo));
  app.use(errorHandlerMiddleware);
  return { app, repo };
}

describe("GET /api/announcements", () => {
  it("200 и список всех объявлений", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/announcements");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("id");
    expect(res.body.data[0]).toHaveProperty("title");
    expect(res.body.data[0]).toHaveProperty("content");
  });

  it("200 и фильтрация объявлений по категории через URL path /category/:category", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/announcements/category/IMPORTANT");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("200 и пустой массив для несуществующей категории", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/announcements/category/NON_EXISTENT_CAT");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toEqual([]);
  });

  it("возвращает полный текст объявления без обрезания до 150 символов", async () => {
    const { app, repo } = createApp();
    const longText = "Уважаемые родители! В пятницу, 27 ноября, в 18:30 состоятся общегимназическое и классные родительские собрания, посвящённые завершению первого учебного периода и результатам успеваемости учащихся старших классов гимназии.";
    await repo.save({
      id: "announcement-long-1",
      title: "Подведение итогов 1-го триместра и собрание",
      description: "Родительские собрания",
      content: longText,
      date: new Date(),
      category: "IMPORTANT",
      createdAt: new Date(),
      authorId: "admin-1",
    });

    const res = await request(app).get("/api/announcements");
    expect(res.status).toBe(200);
    const found = res.body.data.find((a: any) => a.id === "announcement-long-1");
    expect(found).toBeDefined();
    expect(found.content).toBe(longText);
    expect(found.content.endsWith("...")).toBe(false);
  });
});

