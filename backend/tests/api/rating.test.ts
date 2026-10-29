/**
 * API тесты для /api/ratings.
 * GET — публичный, POST — требует JWT (authMiddleware).
 */
import request from "supertest";
import express from "express";
import { ratingRoutes } from "../../src/presentation/routes/ratingRoutes";
import { authRoutes } from "../../src/presentation/routes/authRoutes";
import { MockRatingRepository } from "../../src/infrastructure/database/mock/MockRatingRepository";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const ratingRepo = new MockRatingRepository();
  const userRepo = new MockUserRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/auth", authRoutes(userRepo));
  app.use("/api/ratings", ratingRoutes(ratingRepo));
  app.use(errorHandlerMiddleware);
  return app;
}

function studentToken(): string {
  return signToken({ userId: "user-1", email: "ivan.petrov@primakov.school", role: "STUDENT", permissions: ["rating:create"] });
}

// ───────────────────────────────────────────
// GET /api/ratings
// ───────────────────────────────────────────
describe("GET /api/ratings", () => {
  it("200 и массив оценок для существующего учителя", async () => {
    const res = await request(createApp())
      .get("/api/ratings")
      .query({ teacherId: "teacher-1" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it("у каждой оценки есть teacherId, studentId, rate", async () => {
    const res = await request(createApp())
      .get("/api/ratings")
      .query({ teacherId: "teacher-1" });

    res.body.data.forEach((r: any) => {
      expect(r.teacherId).toBe("teacher-1");
      expect(r.studentId).toBeDefined();
      expect(typeof r.rate).toBe("number");
    });
  });

  it("200 и пустой массив для учителя без оценок", async () => {
    const res = await request(createApp())
      .get("/api/ratings")
      .query({ teacherId: "teacher-without-ratings" });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
  });

  it("400 если teacherId не передан", async () => {
    const res = await request(createApp()).get("/api/ratings");

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toBe("teacherId is required");
  });
});

// ───────────────────────────────────────────
// POST /api/ratings (требует JWT)
// ───────────────────────────────────────────
describe("POST /api/ratings", () => {
  it("401 если токен не передан", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .send({ teacherId: "teacher-1", rate: 5 });

    expect(res.status).toBe(401);
  });

  it("201 при валидных данных и JWT токене", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId: "teacher-1", rate: 8, comment: "Хорошо" });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data.teacherId).toBe("teacher-1");
    expect(res.body.data.rate).toBe(8);
  });

  it("ответ содержит переданный комментарий", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId: "teacher-1", rate: 7, comment: "Интересные уроки" });

    expect(res.body.data.comment).toBe("Интересные уроки");
  });

  it("ответ содержит createdAt в формате ISO строки", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId: "teacher-1", rate: 9 });

    expect(typeof res.body.data.createdAt).toBe("string");
    expect(() => new Date(res.body.data.createdAt)).not.toThrow();
  });

  it("400 если teacherId не передан", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ rate: 5 });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain("teacherId");
  });

  it("400 если rate не передан", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId: "teacher-1" });

    expect(res.status).toBe(400);
  });

  it("оценка без комментария принимается (comment необязателен)", async () => {
    const res = await request(createApp())
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId: "teacher-1", rate: 6 });

    expect(res.status).toBe(201);
  });

  it("новая оценка появляется в GET /api/ratings", async () => {
    const app = createApp();
    const teacherId = "teacher-fresh";

    await request(app)
      .post("/api/ratings")
      .set("Authorization", `Bearer ${studentToken()}`)
      .send({ teacherId, rate: 10, comment: "Отлично!" });

    const getRes = await request(app)
      .get("/api/ratings")
      .query({ teacherId });

    expect(getRes.body.data.length).toBe(1);
    expect(getRes.body.data[0].rate).toBe(10);
  });
});
