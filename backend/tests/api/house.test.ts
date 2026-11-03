import request from "supertest";
import express from "express";
import { houseRoutes } from "../../src/presentation/routes/houseRoutes";
import { MockHouseRepository } from "../../src/infrastructure/database/memory/MockHouseRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const houseRepo = new MockHouseRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/houses", houseRoutes(houseRepo));
  app.use(errorHandlerMiddleware);

  const studentToken = signToken({
    userId: "student-1",
    email: "student@primakov.school",
    role: "STUDENT",
    permissions: ["schedule:read"],
  });

  const teacherToken = signToken({
    userId: "teacher-1",
    email: "teacher@primakov.school",
    role: "TEACHER",
    permissions: ["schedule:read", "rating:read:own"],
  });

  const adminToken = signToken({
    userId: "admin-1",
    email: "admin@primakov.school",
    role: "ADMIN",
    permissions: ["users:create", "analytics:read"],
  });

  return { app, houseRepo, studentToken, teacherToken, adminToken };
}

describe("House System API", () => {
  describe("GET /api/houses/standings", () => {
    it("returns 200 with standings for any authenticated user", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .get("/api/houses/standings")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data.standings)).toBe(true);
      expect(res.body.data.standings.length).toBe(4);
    });
  });

  describe("POST /api/houses/award", () => {
    it("returns 403 when called by a student", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .post("/api/houses/award")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          house: "NORTH",
          points: 20,
          category: "ACADEMIC",
          reason: "Отличный доклад",
        });

      expect(res.status).toBe(403);
    });

    it("returns 200 when called by a teacher and updates standings", async () => {
      const { app, teacherToken } = createApp();
      const res = await request(app)
        .post("/api/houses/award")
        .set("Authorization", `Bearer ${teacherToken}`)
        .send({
          house: "NORTH",
          points: 50,
          category: "OLYMPIAD",
          reason: "Призер регионального этапа",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.house).toBe("NORTH");
      expect(res.body.data.points).toBe(50);

      const standingsRes = await request(app)
        .get("/api/houses/standings")
        .set("Authorization", `Bearer ${teacherToken}`);
      const north = standingsRes.body.data.standings.find((s: any) => s.house === "NORTH");
      expect(north.totalPoints).toBe(50);
    });
  });
});

