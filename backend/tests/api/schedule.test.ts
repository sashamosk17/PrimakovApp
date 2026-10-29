import request from "supertest";
import express from "express";
import { scheduleRoutes } from "../../src/presentation/routes/scheduleRoutes";
import { MockScheduleRepository } from "../../src/infrastructure/database/mock/MockScheduleRepository";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";

function createApp() {
  const scheduleRepo = new MockScheduleRepository();
  const userRepo = new MockUserRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/schedule", scheduleRoutes(scheduleRepo, userRepo));
  app.use(errorHandlerMiddleware);
  return { app, scheduleRepo, userRepo };
}

describe("GET /api/schedule", () => {
  it("200 и расписание для группы", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/schedule/group-10a");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    if (res.body.data) {
      expect(res.body.data.groupId).toBe("group-10a");
      expect(Array.isArray(res.body.data.lessons)).toBe(true);
    }
  });

  it("200 и расписание по группе и дате", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/schedule/group-10a/${today}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("200 и расписание по userId и дате", async () => {
    const { app } = createApp();
    const today = new Date().toISOString().split("T")[0];
    const res = await request(app).get(`/api/schedule/user/user-1/${today}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

