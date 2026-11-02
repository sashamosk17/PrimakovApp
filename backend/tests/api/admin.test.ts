import request from "supertest";
import express from "express";
import { adminRoutes } from "../../src/presentation/routes/adminRoutes";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { MockRequestRepository } from "../../src/infrastructure/database/memory/MockRequestRepository";
import { MockRatingRepository } from "../../src/infrastructure/database/memory/MockRatingRepository";
import { MockAnnouncementRepository } from "../../src/infrastructure/database/memory/MockAnnouncementRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";
import { Role } from "../../src/shared/types";
import { ROLE_PERMISSIONS } from "../../src/shared/constants";

function createAdminApp() {
  const userRepo = new MockUserRepository();
  const requestRepo = new MockRequestRepository();
  const ratingRepo = new MockRatingRepository();
  const announcementRepo = new MockAnnouncementRepository();

  const app = express();
  app.use(express.json());
  app.use("/api/admin", adminRoutes({
    userRepository: userRepo,
    requestRepository: requestRepo,
    ratingRepository: ratingRepo,
    announcementRepository: announcementRepo,
  }));
  app.use(errorHandlerMiddleware);

  return { app, userRepo, requestRepo, ratingRepo, announcementRepo };
}

function makeToken(userId = "admin-1", role: Role = "ADMIN") {
  return signToken({
    userId,
    email: "admin@primakov.school",
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
  });
}

describe("Admin API - RBAC & Access Control", () => {
  it("401 Unauthorized when no Authorization header is provided", async () => {
    const { app } = createAdminApp();
    const res = await request(app).get("/api/admin/dashboard");
    expect(res.status).toBe(401);
  });

  it("403 Forbidden when STUDENT tries to access admin routes", async () => {
    const { app } = createAdminApp();
    const studentToken = makeToken("student-1", "STUDENT");
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${studentToken}`);

    expect(res.status).toBe(403);
    expect(res.body.status).toBe("error");
  });

  it("403 Forbidden when TEACHER tries to access admin routes", async () => {
    const { app } = createAdminApp();
    const teacherToken = makeToken("teacher-1", "TEACHER");
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${teacherToken}`);

    expect(res.status).toBe(403);
  });

  it("200 OK when ADMIN accesses dashboard", async () => {
    const { app } = createAdminApp();
    const adminToken = makeToken("admin-1", "ADMIN");
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("metrics");
    expect(res.body.data.metrics).toHaveProperty("totalStudents");
    expect(res.body.data.metrics).toHaveProperty("totalTeachers");
    expect(res.body.data.metrics).toHaveProperty("activeRequests");
    expect(res.body.data.metrics).toHaveProperty("csiIndex");
    expect(res.body.data).toHaveProperty("weeklyActivity");
    expect(Array.isArray(res.body.data.weeklyActivity)).toBe(true);
  });
});

describe("Admin API - Users Management (/api/admin/users)", () => {
  const adminToken = makeToken("admin-1", "ADMIN");

  it("GET /api/admin/users returns paginated list of users with total count", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .get("/api/admin/users?page=1&limit=10")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("users");
    expect(res.body.data).toHaveProperty("total");
    expect(res.body.data).toHaveProperty("page", 1);
    expect(res.body.data).toHaveProperty("limit", 10);
    expect(Array.isArray(res.body.data.users)).toBe(true);
    expect(res.body.data.users.length).toBeGreaterThan(0);
    // Password hashes must NEVER be exposed
    expect(res.body.data.users[0]).not.toHaveProperty("passwordHash");
  });

  it("GET /api/admin/users filters by role and search query", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .get("/api/admin/users?role=STUDENT&search=Иван")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.users.every((u: any) => u.role === "STUDENT")).toBe(true);
  });

  it("POST /api/admin/users creates a new user successfully", async () => {
    const { app } = createAdminApp();
    const newUser = {
      email: "new.student@primakov.school",
      password: "SecurePassword123!",
      firstName: "Даниил",
      lastName: "Волков",
      role: "STUDENT",
    };

    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send(newUser);

    expect(res.status).toBe(201);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.email).toBe("new.student@primakov.school");
    expect(res.body.data.firstName).toBe("Даниил");
    expect(res.body.data.role).toBe("STUDENT");
    expect(res.body.data).not.toHaveProperty("password");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });

  it("POST /api/admin/users returns 400 when email format is invalid", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .post("/api/admin/users")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        email: "not-an-email",
        password: "Pass",
        firstName: "",
        lastName: "",
        role: "STUDENT",
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("PATCH /api/admin/users/:id/status toggles user active status", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .patch("/api/admin/users/user-1/status")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ isActive: false });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.isActive).toBe(false);
  });

  it("DELETE /api/admin/users/:id soft-deletes a user", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .delete("/api/admin/users/user-2")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });

  it("POST /api/admin/users/import batch imports users", async () => {
    const { app } = createAdminApp();
    const usersToImport = [
      {
        email: "batch1@primakov.school",
        password: "Password123!",
        firstName: "Петр",
        lastName: "Григорьев",
        role: "STUDENT",
      },
      {
        email: "batch2@primakov.school",
        password: "Password123!",
        firstName: "Ольга",
        lastName: "Николаева",
        role: "TEACHER",
      },
    ];

    const res = await request(app)
      .post("/api/admin/users/import")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ users: usersToImport });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.importedCount).toBe(2);
    expect(res.body.data.failedCount).toBe(0);
  });
});

describe("Admin API - Requests Management (/api/admin/requests)", () => {
  const adminToken = makeToken("admin-1", "ADMIN");

  it("GET /api/admin/requests returns all service requests", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .get("/api/admin/requests")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it("PATCH /api/admin/requests/:id updates request status and assignment", async () => {
    const { app, requestRepo } = createAdminApp();
    // create a request first
    const newReq = {
      id: "req-admin-test-1",
      type: "IT" as const,
      title: "Broken Projector",
      description: "Room 305 projector not turning on",
      status: "PENDING" as const,
      priority: "HIGH" as const,
      creatorId: "user-1",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    await requestRepo.save(newReq);

    const res = await request(app)
      .patch("/api/admin/requests/req-admin-test-1")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({
        status: "IN_PROGRESS",
        assigneeId: "admin-1",
        notes: "Assigned technician",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.status).toBe("IN_PROGRESS");
    expect(res.body.data.assigneeId).toBe("admin-1");
  });
});

describe("Admin API - Ratings Moderation (/api/admin/ratings)", () => {
  const adminToken = makeToken("admin-1", "ADMIN");

  it("GET /api/admin/ratings returns ratings with detailed student information", async () => {
    const { app } = createAdminApp();
    const res = await request(app)
      .get("/api/admin/ratings")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});

