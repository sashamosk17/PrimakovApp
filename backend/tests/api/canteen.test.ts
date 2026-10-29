import request from "supertest";
import express from "express";
import { canteenRoutes } from "../../src/presentation/routes/canteenRoutes";
import { MockCanteenMenuRepository } from "../../src/infrastructure/database/mock/MockCanteenMenuRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";

function createApp() {
  const repo = new MockCanteenMenuRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/canteen", canteenRoutes(repo));
  app.use(errorHandlerMiddleware);
  return { app, repo };
}

describe("GET /api/canteen/menu/today", () => {
  it("200 и сегодняшнее меню столовой", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/canteen/menu/today");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("mealType");
    expect(Array.isArray(res.body.data[0].items)).toBe(true);
  });
});

describe("GET /api/canteen/menu/:date", () => {
  it("200 и меню столовой на конкретную дату", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/canteen/menu/${today}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("400 при передаче невалидного формата даты", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/canteen/menu/not-a-date");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Invalid date format");
  });
});

describe("GET /api/canteen/menu/:date/:mealType", () => {
  it("200 и меню для конкретного приёма пищи (BREAKFAST)", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/canteen/menu/${today}/BREAKFAST`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.mealType).toBe("BREAKFAST");
    expect(Array.isArray(res.body.data.items)).toBe(true);
  });

  it("400 для невалидного типа приёма пищи", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/canteen/menu/${today}/MIDNIGHT_SNACK`);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Invalid meal type");
  });

  it("404 если меню для приёма пищи не найдено", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/canteen/menu/${today}/DINNER`);

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Menu not found");
  });
});

