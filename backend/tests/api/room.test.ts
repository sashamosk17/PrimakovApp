import request from "supertest";
import express from "express";
import { roomRoutes } from "../../src/presentation/routes/roomRoutes";
import { MockRoomRepository } from "../../src/infrastructure/database/mock/MockRoomRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";

function createApp() {
  const repo = new MockRoomRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/rooms", roomRoutes(repo));
  app.use(errorHandlerMiddleware);
  return { app, repo };
}

describe("GET /api/rooms", () => {
  it("200 и список всех аудиторий", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("number");
    expect(res.body.data[0]).toHaveProperty("building");
  });

  it("200 и получение аудитории по номеру /:number", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms/101");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.number).toBe("101");
  });

  it("404 для несуществующего номера аудитории", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms/9999");

    expect(res.status).toBe(404);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Room not found");
  });

  it("200 и фильтрация аудиторий по корпусу /building/:building", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms/building/Main");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((r: any) => expect(r.building.toLowerCase()).toBe("main"));
  });

  it("200 и фильтрация аудиторий по этажу /building/:building/floor/:floor", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms/building/Main/floor/1");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.length).toBeGreaterThan(0);
    res.body.data.forEach((r: any) => {
      expect(r.building.toLowerCase()).toBe("main");
      expect(r.floor).toBe(1);
    });
  });

  it("400 если указан нечисловой этаж", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/rooms/building/Main/floor/first");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Invalid floor number");
  });
});

