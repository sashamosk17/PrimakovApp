import request from "supertest";
import express from "express";
import { gradeRoutes } from "../../src/presentation/routes/gradeRoutes";
import { MockGradeRepository } from "../../src/infrastructure/database/memory/MockGradeRepository";
import { MockUserRepository } from "../../src/infrastructure/database/memory/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";
import { User } from "../../src/domain/entities/User";
import { Email } from "../../src/domain/value-objects/Email";
import { Password } from "../../src/domain/value-objects/Password";
import { Grade } from "../../src/domain/entities/Grade";

function createApp() {
  const gradeRepo = new MockGradeRepository();
  const userRepo = new MockUserRepository();

  const student = new User(
    "std-1111-2222-3333-444444444444",
    Email.create("andrey.orlov@primakov.school").value,
    Password.fromHash("$2b$10$hashedpasswordplaceholder1234567890"),
    "Андрей",
    "Орлов",
    "STUDENT",
    new Date(),
    undefined,
    true,
    undefined,
    undefined,
    false,
    undefined,
    "10А"
  );
  userRepo.save(student);

  const admin = new User(
    "adm-1111-2222-3333-444444444444",
    Email.create("admin@primakov.school").value,
    Password.fromHash("$2b$10$hashedpasswordplaceholder1234567890"),
    "Администратор",
    "Системы",
    "ADMIN",
    new Date()
  );
  userRepo.save(admin);

  const app = express();
  app.use(express.json());
  app.use("/api/grades", gradeRoutes(gradeRepo, userRepo));
  app.use(errorHandlerMiddleware);

  const studentToken = signToken({
    userId: student.id,
    email: student.email.value,
    role: "STUDENT",
    permissions: ["schedule:read", "deadline:create"],
  });

  const adminToken = signToken({
    userId: admin.id,
    email: admin.email.value,
    role: "ADMIN",
    permissions: ["users:create", "users:read:all", "schedule:read"],
  });

  return { app, gradeRepo, userRepo, student, admin, studentToken, adminToken };
}

describe("Grades API", () => {
  describe("GET /api/grades/my", () => {
    it("returns 401 if unauthenticated", async () => {
      const { app } = createApp();
      const res = await request(app).get("/api/grades/my");
      expect(res.status).toBe(401);
    });

    it("returns 200 with student grades summary when authenticated", async () => {
      const { app, gradeRepo, student, studentToken } = createApp();

      const g1 = new Grade("g-1", student.id, "sub-1", "Алгебра", 5, 2, "2026-10-10", "1 триместр");
      const g2 = new Grade("g-2", student.id, "sub-1", "Алгебра", 4, 1, "2026-10-12", "1 триместр");
      await gradeRepo.saveBatch([g1, g2]);

      const res = await request(app)
        .get("/api/grades/my?period=1%20триместр")
        .set("Authorization", `Bearer ${studentToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].subjectName).toBe("Алгебра");
      expect(res.body.data[0].averageScore).toBe(4.67);
      expect(res.body.data[0].periodMark).toBe(5);
    });
  });

  describe("POST /api/grades/admin/import (or /api/admin/grades/import)", () => {
    it("returns 403 when called by student", async () => {
      const { app, studentToken } = createApp();
      const res = await request(app)
        .post("/api/grades/admin/import")
        .set("Authorization", `Bearer ${studentToken}`)
        .send({ csvData: "10А, Орлов Андрей, Алгебра, 5(1), 1 триместр" });

      expect(res.status).toBe(403);
    });

    it("returns 200 and imports grades when called by admin", async () => {
      const { app, adminToken } = createApp();
      const csvData = `Класс, ФИО Ученика, Предмет, Оценки, Период
10А, Орлов Андрей, Алгебра, "5(1) 4(1.5) 5(2)", 1 триместр`;

      const res = await request(app)
        .post("/api/grades/admin/import")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ csvData });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.importedGradesCount).toBe(3);
      expect(res.body.data.matchedStudentsCount).toBe(1);
    });
  });
});

