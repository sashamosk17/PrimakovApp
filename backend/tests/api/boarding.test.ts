import request from "supertest";
import express from "express";
import { boardingRoutes } from "../../src/presentation/routes/boardingRoutes";
import { MockBoardingRepository } from "../../src/infrastructure/database/memory/MockBoardingRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const boardingRepo = new MockBoardingRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/boarding", boardingRoutes(boardingRepo));
  app.use(errorHandlerMiddleware);

  const studentToken = signToken({
    userId: "student-b-1",
    email: "boarding.student@primakov.school",
    role: "STUDENT",
    permissions: ["schedule:read"],
  });

  const adminToken = signToken({
    userId: "admin-1",
    email: "admin@primakov.school",
    role: "ADMIN",
    permissions: ["users:read:all", "schedule:read"],
  });

  return { app, boardingRepo, studentToken, adminToken };
}

describe("Boarding API", () => {
  describe("POST /api/boarding/check-in", () => {
    it("returns 401 if unauthenticated", async () => {
      const { app } = createApp();
      const res = await request(app).post("/api/boarding/check-in").send({});
      expect(res.status).toBe(401);
    });

    it("registers check-in when student is authenticated", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .post("/api/boarding/check-in")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ notes: "Кампус Раздоры, QR-код корпуса 1" });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.status).toBe("PRESENT");
    });
  });

  describe("GET /api/boarding/my-status", () => {
    it("returns student status and last checkin", async () => {
      const { app, studentToken } = createApp();
      // First check in
      await request(app)
        .post("/api/boarding/check-in")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ notes: "Вечерняя перекличка" });

      const res = await request(app)
        .get("/api/boarding/my-status")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.lastCheckIn).toBeDefined();
    });
  });

  describe("POST /api/boarding/leave-request", () => {
    it("creates weekend leave request", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .post("/api/boarding/leave-request")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          departureDate: "2026-10-30T17:00:00Z",
          returnDate: "2026-11-01T21:00:00Z",
          transportType: "SHUTTLE",
          guardianConfirmed: true,
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.status).toBe("PENDING");
      expect(res.body.data.transportType).toBe("SHUTTLE");
    });
  });

  describe("GET /api/boarding/admin/roster (or GET /api/admin/boarding/roster)", () => {
    it("returns 403 when called by student", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .get("/api/boarding/admin/roster")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(403);
    });

    it("returns 200 with boarding roster when called by admin", async () => {
      const { app, adminToken } = createApp();
      const res = await request(app)
        .get("/api/boarding/admin/roster")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data)).toBe(true);
    });
  });

  describe("Admin Leave Requests Management", () => {
    it("allows staff to list and update leave request status", async () => {
      const { app, studentToken, adminToken } = createApp();

      // Create request first
      const createRes = await request(app)
        .post("/api/boarding/leave-request")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({
          departureDate: "2026-10-30T17:00:00Z",
          returnDate: "2026-11-01T21:00:00Z",
          transportType: "PARENTS",
          guardianConfirmed: true,
        });

      const requestId = createRes.body.data.id;

      // Staff gets leave requests
      const listRes = await request(app)
        .get("/api/boarding/admin/leave-requests")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.some((r: any) => r.id === requestId)).toBe(true);

      // Staff approves leave request
      const updateRes = await request(app)
        .patch(`/api/boarding/admin/leave-requests/${requestId}/status`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ status: "APPROVED" });

      expect(updateRes.status).toBe(200);
      expect(updateRes.body.status).toBe("success");
    });
  });
});

