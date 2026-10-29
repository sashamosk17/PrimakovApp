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

