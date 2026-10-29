import request from "supertest";
import express from "express";
import { userRoutes } from "../../src/presentation/routes/userRoutes";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";

function createApp() {
  const repo = new MockUserRepository();
  const app = express();
  app.use(express.json());
  app.use("/api/users", userRoutes(repo));
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

describe("GET /api/users/teachers", () => {
  it("200 и список преподавателей", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/users/teachers");

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("fullName");
  });
});

describe("GET /api/users/me", () => {
  it("401 без токена авторизации", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/users/me");

    expect(res.status).toBe(401);
  });

  it("200 и данные текущего профиля с токеном", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/users/me")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.id).toBe("user-1");
    expect(res.body.data.email).toBe("ivan.petrov@primakov.school");
    expect(res.body.data).not.toHaveProperty("password");
    expect(res.body.data).not.toHaveProperty("passwordHash");
  });
});

describe("PUT /api/users/me", () => {
  it("401 без токена авторизации", async () => {
    const { app } = createApp();
    const res = await request(app).put("/api/users/me").send({ firstName: "Иван" });

    expect(res.status).toBe(401);
  });

  it("200 при успешном обновлении профиля", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({ firstName: "Иван", lastName: "Иванов" });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.firstName).toBe("Иван");
    expect(res.body.data.lastName).toBe("Иванов");
  });

  it("400 если передано пустое имя", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({ firstName: "   " });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });
});

describe("PUT /api/users/me/password", () => {
  it("401 без токена авторизации", async () => {
    const { app } = createApp();
    const res = await request(app).put("/api/users/me/password").send({
      currentPassword: "password123",
      newPassword: "newpassword123",
    });

    expect(res.status).toBe(401);
  });

  it("400 если не передан текущий или новый пароль", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({ currentPassword: "password123" });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
  });

  it("400 если текущий пароль неверный", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        currentPassword: "WRONG_PASSWORD",
        newPassword: "newpassword123",
      });

    expect(res.status).toBe(400);
    expect(res.body.status).toBe("error");
    expect(res.body.error.message).toContain("Current password is incorrect");
  });

  it("200 при успешной смене пароля", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me/password")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        currentPassword: "password123",
        newPassword: "newpassword123",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

describe("Profile extensions: avatarUrl and twoFactorEnabled", () => {
  it("200 обновление avatarUrl и twoFactorEnabled", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        avatarUrl: "https://example.com/avatar.jpg",
        twoFactorEnabled: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.avatarUrl).toBe("https://example.com/avatar.jpg");
    expect(res.body.data.twoFactorEnabled).toBe(true);
  });
});

describe("GET /api/users/me/sessions", () => {
  it("401 без токена", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/users/me/sessions");
    expect(res.status).toBe(401);
  });

  it("200 возвращает активные сессии пользователя", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/users/me/sessions")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0]).toHaveProperty("device");
    expect(res.body.data[0]).toHaveProperty("ipAddress");
  });
});

describe("DELETE /api/users/me/sessions/:sessionId", () => {
  it("401 без токена", async () => {
    const { app } = createApp();
    const res = await request(app).delete("/api/users/me/sessions/session-2");
    expect(res.status).toBe(401);
  });

  it("200 отзывает сессию", async () => {
    const { app } = createApp();
    const res = await request(app)
      .delete("/api/users/me/sessions/session-2")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
  });
});

describe("GET /api/users/me/notifications", () => {
  it("401 без токена", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/users/me/notifications");
    expect(res.status).toBe(401);
  });

  it("200 возвращает настройки уведомлений", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/users/me/notifications")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("pushEnabled");
    expect(res.body.data).toHaveProperty("deadlineNotifications");
    expect(res.body.data).toHaveProperty("scheduleNotifications");
    expect(res.body.data).toHaveProperty("announcementNotifications");
  });
});

describe("PUT /api/users/me/notifications", () => {
  it("401 без токена", async () => {
    const { app } = createApp();
    const res = await request(app).put("/api/users/me/notifications").send({ pushEnabled: false });
    expect(res.status).toBe(401);
  });

  it("200 обновляет настройки уведомлений", async () => {
    const { app } = createApp();
    const res = await request(app)
      .put("/api/users/me/notifications")
      .set("Authorization", `Bearer ${makeToken("user-1")}`)
      .send({
        pushEnabled: false,
        deadlineNotifications: true,
        scheduleNotifications: false,
        announcementNotifications: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data.pushEnabled).toBe(false);
    expect(res.body.data.scheduleNotifications).toBe(false);
    expect(res.body.data.announcementNotifications).toBe(true);
  });
});

describe("GET /api/users/me/stats", () => {
  it("401 без токена", async () => {
    const { app } = createApp();
    const res = await request(app).get("/api/users/me/stats");
    expect(res.status).toBe(401);
  });

  it("200 возвращает академическую статистику студента", async () => {
    const { app } = createApp();
    const res = await request(app)
      .get("/api/users/me/stats")
      .set("Authorization", `Bearer ${makeToken("user-1")}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("gpa");
    expect(res.body.data).toHaveProperty("attendanceRate");
    expect(res.body.data).toHaveProperty("totalLessons");
    expect(res.body.data).toHaveProperty("completedDeadlines");
    expect(res.body.data).toHaveProperty("pendingDeadlines");
    expect(typeof res.body.data.gpa).toBe("number");
    expect(typeof res.body.data.attendanceRate).toBe("number");
  });
});

