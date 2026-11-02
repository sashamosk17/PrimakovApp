import request from "supertest";
import express from "express";
import { adminRoutes } from "../../src/presentation/routes/adminRoutes";
import { deadlineRoutes } from "../../src/presentation/routes/deadlineRoutes";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { MockRequestRepository } from "../../src/infrastructure/database/memory/MockRequestRepository";
import { MockRatingRepository } from "../../src/infrastructure/database/memory/MockRatingRepository";
import { MockAnnouncementRepository } from "../../src/infrastructure/database/memory/MockAnnouncementRepository";
import { MockSubjectRepository } from "../../src/infrastructure/database/memory/MockSubjectRepository";
import { MockScheduleRepository } from "../../src/infrastructure/database/memory/MockScheduleRepository";
import { MockDeadlineRepository } from "../../src/infrastructure/database/memory/MockDeadlineRepository";
import { MockNotificationPreferencesRepository } from "../../src/infrastructure/database/memory/MockNotificationPreferencesRepository";
import { MockDeadlineNotificationLogRepository } from "../../src/infrastructure/database/memory/MockDeadlineNotificationLogRepository";
import { MockPushNotificationService } from "../../src/infrastructure/external-services/MockPushNotificationService";
import { ProcessDeadlineNotificationsUseCase } from "../../src/application/deadline/ProcessDeadlineNotificationsUseCase";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";
import { Role } from "../../src/shared/types";
import { ROLE_PERMISSIONS } from "../../src/shared/constants";
import { Schedule } from "../../src/domain/entities/Schedule";
import { Lesson } from "../../src/domain/entities/Lesson";
import { TimeSlot } from "../../src/domain/value-objects/TimeSlot";
import { Room } from "../../src/domain/value-objects/Room";
import { Deadline } from "../../src/domain/entities/Deadline";
import { DeadlineStatus } from "../../src/domain/value-objects/DeadlineStatus";
import { randomUUID } from "crypto";

function makeToken(userId = "admin-1", role: Role = "ADMIN") {
  return signToken({
    userId,
    email: "admin@primakov.school",
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
  });
}

function createFullApp() {
  const userRepo = new MockUserRepository();
  const requestRepo = new MockRequestRepository();
  const ratingRepo = new MockRatingRepository();
  const announcementRepo = new MockAnnouncementRepository();
  const subjectRepo = new MockSubjectRepository();
  const scheduleRepo = new MockScheduleRepository();
  const deadlineRepo = new MockDeadlineRepository();
  const notifPrefRepo = new MockNotificationPreferencesRepository();
  const notifLogRepo = new MockDeadlineNotificationLogRepository();
  const pushService = new MockPushNotificationService();

  const processDeadlineNotificationsUseCase = new ProcessDeadlineNotificationsUseCase(
    deadlineRepo,
    notifPrefRepo,
    notifLogRepo,
    pushService
  );

  const app = express();
  app.use(express.json());

  app.use(
    "/api/admin",
    adminRoutes({
      userRepository: userRepo,
      requestRepository: requestRepo,
      ratingRepository: ratingRepo,
      announcementRepository: announcementRepo,
      subjectRepository: subjectRepo,
      scheduleRepository: scheduleRepo,
    })
  );

  app.use("/api/deadlines", deadlineRoutes(deadlineRepo, processDeadlineNotificationsUseCase));

  app.use(errorHandlerMiddleware);

  return {
    app,
    userRepo,
    subjectRepo,
    scheduleRepo,
    deadlineRepo,
    pushService,
  };
}

describe("Admin API - Subjects, Schedules & Push Alerts (Sprint 1)", () => {
  const adminToken = makeToken("admin-1", "ADMIN");

  describe("Subjects & Teacher Assignments API", () => {
    it("GET /api/admin/subjects returns seeded subjects", async () => {
      const { app } = createFullApp();
      const res = await request(app)
        .get("/api/admin/subjects")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      expect(res.body.data[0].name).toBeDefined();
    });

    it("POST /api/admin/subjects creates a new subject", async () => {
      const { app } = createFullApp();
      const res = await request(app)
        .post("/api/admin/subjects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          name: "Робототехника",
          description: "Конструирование и программирование микроконтроллеров",
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.name).toBe("Робототехника");
    });

    it("DELETE /api/admin/subjects/:id removes a subject", async () => {
      const { app } = createFullApp();
      // First create one
      const createRes = await request(app)
        .post("/api/admin/subjects")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ name: "Черчение" });

      const subjectId = createRes.body.data.id;

      const delRes = await request(app)
        .delete(`/api/admin/subjects/${subjectId}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.status).toBe("success");
    });

    it("POST /api/admin/teachers/:teacherId/subjects assigns teacher to subject", async () => {
      const { app, subjectRepo } = createFullApp();
      const teacherId = randomUUID();
      const subjects = (await subjectRepo.findAll()).value;
      const targetSubject = subjects[0];

      const res = await request(app)
        .post(`/api/admin/teachers/${teacherId}/subjects`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ subjectId: targetSubject.id });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");

      // Verify with GET
      const getRes = await request(app)
        .get(`/api/admin/teachers/${teacherId}/subjects`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(getRes.status).toBe(200);
      expect(getRes.body.data.some((s: any) => s.id === targetSubject.id)).toBe(true);
    });

    it("DELETE /api/admin/teachers/:teacherId/subjects/:subjectId unassigns teacher", async () => {
      const { app, subjectRepo } = createFullApp();
      const teacherId = randomUUID();
      const subjects = (await subjectRepo.findAll()).value;
      const targetSubject = subjects[0];

      await subjectRepo.assignTeacherSubject(teacherId, targetSubject.id);

      const res = await request(app)
        .delete(`/api/admin/teachers/${teacherId}/subjects/${targetSubject.id}`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
    });
  });

  describe("Schedules & Substitutions API", () => {
    it("GET /api/admin/schedules returns list of schedules", async () => {
      const { app } = createFullApp();
      const res = await request(app)
        .get("/api/admin/schedules")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it("PATCH /api/admin/schedules/lessons/:id/substitute updates lesson teacher", async () => {
      const { app, scheduleRepo } = createFullApp();
      const scheduleId = randomUUID();
      const lessonId = randomUUID();
      const origTeacher = randomUUID();
      const newTeacher = randomUUID();

      const timeSlot = TimeSlot.create("08:30", "09:15").value;
      const room = Room.create("301", "A", 3).value;
      const lesson = new Lesson(lessonId, "Математика", origTeacher, timeSlot, room, 3);
      const schedule = new Schedule(scheduleId, "10-A", new Date(), [lesson], new Date());
      await scheduleRepo.save(schedule);

      const res = await request(app)
        .patch(`/api/admin/schedules/lessons/${lessonId}/substitute`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scheduleId,
          newTeacherId: newTeacher,
          comment: "Больничный лист",
        });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.teacherId).toBe(newTeacher);
    });

    it("POST /api/admin/schedules/lessons adds a lesson to a schedule", async () => {
      const { app, scheduleRepo } = createFullApp();
      const scheduleId = randomUUID();
      const schedule = new Schedule(scheduleId, "9-A", new Date(), [], new Date());
      await scheduleRepo.save(schedule);

      const res = await request(app)
        .post("/api/admin/schedules/lessons")
        .set("Authorization", `Bearer ${adminToken}`)
        .send({
          scheduleId,
          subject: "Биология",
          teacherId: randomUUID(),
          startTime: "12:00",
          endTime: "12:45",
          roomNumber: "205",
          building: "A",
          floor: 2,
        });

      expect(res.status).toBe(201);
      expect(res.body.status).toBe("success");
      expect(res.body.data.subject).toBe("Биология");
    });
  });

  describe("Deadline Alert Worker Check API", () => {
    it("POST /api/deadlines/check-alerts triggers deadline alert worker check", async () => {
      const { app, deadlineRepo, pushService } = createFullApp();
      (deadlineRepo as any).deadlines = [];
      const now = new Date();
      const dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24h away

      const deadline = new Deadline(
        randomUUID(),
        "Эссе по МХК",
        "Сдать реферат",
        dueDate,
        "user-student-1",
        DeadlineStatus.PENDING,
        now,
        now,
        undefined,
        "МХК"
      );
      await deadlineRepo.save(deadline);

      const res = await request(app)
        .post("/api/deadlines/check-alerts")
        .send({ referenceTime: now.toISOString() });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe("success");
      expect(res.body.data.sentCount).toBe(1);
      expect(pushService.sentNotifications.length).toBe(1);
    });
  });
});
