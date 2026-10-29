import request from "supertest";
import express from "express";
import { requestRoutes } from "../../src/presentation/routes/requestRoutes";
import { MockRequestRepository } from "../../src/infrastructure/database/mock/MockRequestRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const repo = new MockRequestRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/requests", requestRoutes(repo));
  app.use(errorHandlerMiddleware);
  return { app, repo };
}

function makeToken(userId = "user-1", role: "STUDENT" | "TEACHER" | "ADMIN" = "STUDENT") {
  return signToken({
    userId,
    email: "ivan.petrov@primakov.school",
    role,
    permissions: [],
  });
}

describe("POST /api/requests", () => {
  it("401 без токена авторизации", async () => {
    const { app } = createApp();
    const res = await request(app).post("/api/requests").send({
      type: "IT",
      title: "Сломан монитор",
    });

    expect(res.status).toBe(401);
  });

  it("201 при успешном создании заявки", async () => {
    const { app } = createApp();
    const res = await request(app)
      .post("/api/requests")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        type: "IT",
        title: "Сломан монитор",
        description: "Монитор не показывает картинку",
        priority: "HIGH",
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.message).toBe("Request created successfully");
  });
});

describe("GET /api/requests", () => {
  it("401 без токена авторизации", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/requests");

    expect(res.status).toBe(401);
  });

  it("200 и список заявок текущего пользователя", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/requests")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
});

describe("GET /api/requests/assigned", () => {
  it("200 и список заявок, назначенных на пользователя", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/requests/assigned")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

describe("GET /api/requests/active", () => {
  it("200 и список активных заявок", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/requests/active")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((r: any) => {
      expect(["COMPLETED", "CANCELLED"]).not.toContain(r.status);
    });
  });
});

describe("GET /api/requests/type/:type", () => {
  it("200 и фильтрация по типу IT", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/requests/type/IT")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    res.body.data.forEach((r: any) => expect(r.type).toBe("IT"));
  });

  it("400 при передаче невалидного типа заявки", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/requests/type/UNKNOWN_TYPE")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("Invalid request type");
  });
});

describe("PATCH /api/requests/:id/status", () => {
  it("200 при обновлении статуса заявки", async () => {
    const { app } = createApp();
    const res = await request(app)
      .patch("/api/requests/req-1/status")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        status: "COMPLETED",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

