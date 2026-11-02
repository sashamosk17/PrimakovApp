import request from "supertest";
import express from "express";
import { adminRoutes } from "../../src/presentation/routes/adminRoutes";
import { MockUserRepository } from "../../src/infrastructure/database/mock/MockUserRepository";
import { MockRequestRepository } from "../../src/infrastructure/database/memory/MockRequestRepository";
import { MockRatingRepository } from "../../src/infrastructure/database/memory/MockRatingRepository";
import { MockCanteenMenuRepository } from "../../src/infrastructure/database/mock/MockCanteenMenuRepository";
import { errorHandlerMiddleware } from "../../src/presentation/middleware/errorHandlerMiddleware";
import { signToken } from "../../src/shared/utils/jwt";
import { Role } from "../../src/shared/types";
import { ROLE_PERMISSIONS } from "../../src/shared/constants";

function makeToken(userId = "admin-1", role: Role = "ADMIN") {
  return signToken({
    userId,
    email: "admin@primakov.school",
    role,
    permissions: ROLE_PERMISSIONS[role] || [],
  });
}

function createCanteenApp() {
  const userRepo = new MockUserRepository();
  const requestRepo = new MockRequestRepository();
  const ratingRepo = new MockRatingRepository();
  const canteenRepo = new MockCanteenMenuRepository();

  const app = express();
  app.use(express.json());

  app.use(
    "/api/admin",
    adminRoutes({
      userRepository: userRepo,
      requestRepository: requestRepo,
      ratingRepository: ratingRepo,
      canteenMenuRepository: canteenRepo,
    })
  );

  app.use(errorHandlerMiddleware);

  return { app, canteenRepo };
}

describe("Admin Canteen API Endpoints (/api/admin/canteen)", () => {
  it("POST /api/admin/canteen/menu - создает/актуализирует меню", async () => {
    const { app } = createCanteenApp();
    const token = makeToken("admin-1", "ADMIN");

    const res = await request(app)
      .post("/api/admin/canteen/menu")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-11-20",
        mealType: "LUNCH",
        isActive: true,
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("id");
    expect(res.body.data.mealType).toBe("LUNCH");
  });

  it("POST /api/admin/canteen/items - добавляет блюдо с КБЖУ и аллергенами", async () => {
    const { app, canteenRepo } = createCanteenApp();
    const token = makeToken("admin-1", "ADMIN");

    // Сначала создаем меню
    const menuRes = await request(app)
      .post("/api/admin/canteen/menu")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-11-20",
        mealType: "DINNER",
      });

    const menuId = menuRes.body.data.id;

    // Добавляем блюдо
    const itemRes = await request(app)
      .post("/api/admin/canteen/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        menuId,
        name: "Лосось на пару с брокколи",
        description: "Филе лосося с паровыми соцветиями брокколи",
        category: "Горячее",
        calories: 320,
        protein: 34.0,
        fat: 14.5,
        carbs: 6.0,
        weight: 220,
        price: 350,
        isVegetarian: false,
        isVegan: false,
        allergens: ["рыба"],
      });

    expect(itemRes.status).toBe(201);
    expect(itemRes.body.status).toBe("success");
    expect(itemRes.body.data.name).toBe("Лосось на пару с брокколи");
    expect(itemRes.body.data.allergens).toContain("рыба");
  });

  it("PUT /api/admin/canteen/items/:id - обновляет блюдо", async () => {
    const { app } = createCanteenApp();
    const token = makeToken("admin-1", "ADMIN");

    const menuRes = await request(app)
      .post("/api/admin/canteen/menu")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-11-20",
        mealType: "BREAKFAST",
      });
    const menuId = menuRes.body.data.id;

    const createItem = await request(app)
      .post("/api/admin/canteen/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        menuId,
        name: "Блинчики",
        price: 100,
      });
    const itemId = createItem.body.data.id;

    const updateRes = await request(app)
      .put(`/api/admin/canteen/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        menuId,
        name: "Блинчики с творогом и медом",
        price: 140,
        calories: 290,
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.status).toBe("success");
    expect(updateRes.body.data.name).toBe("Блинчики с творогом и медом");
    expect(updateRes.body.data.price).toBe(140);
  });

  it("DELETE /api/admin/canteen/items/:id - удаляет блюдо", async () => {
    const { app } = createCanteenApp();
    const token = makeToken("admin-1", "ADMIN");

    const menuRes = await request(app)
      .post("/api/admin/canteen/menu")
      .set("Authorization", `Bearer ${token}`)
      .send({
        date: "2026-11-20",
        mealType: "SNACK",
      });
    const menuId = menuRes.body.data.id;

    const createItem = await request(app)
      .post("/api/admin/canteen/items")
      .set("Authorization", `Bearer ${token}`)
      .send({
        menuId,
        name: "Яблочный сок",
        price: 60,
      });
    const itemId = createItem.body.data.id;

    const delRes = await request(app)
      .delete(`/api/admin/canteen/items/${itemId}`)
      .set("Authorization", `Bearer ${token}`);

    expect(delRes.status).toBe(200);
    expect(delRes.body.status).toBe("success");
  });

  it("POST /api/admin/canteen/copy-week - копирует рацион на неделю", async () => {
    const { app } = createCanteenApp();
    const token = makeToken("admin-1", "ADMIN");

    const res = await request(app)
      .post("/api/admin/canteen/copy-week")
      .set("Authorization", `Bearer ${token}`)
      .send({
        fromWeekStart: "2026-11-09",
        toWeekStart: "2026-11-16",
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe("success");
    expect(res.body.data).toHaveProperty("copiedMenusCount");
  });

  it("403 если запрос делает пользователь с ролью STUDENT", async () => {
    const { app } = createCanteenApp();
    const studentToken = makeToken("student-1", "STUDENT");

    const res = await request(app)
      .post("/api/admin/canteen/menu")
      .set("Authorization", `Bearer ${studentToken}`)
      .send({
        date: "2026-11-20",
        mealType: "LUNCH",
      });

    expect(res.status).toBe(403);
  });
});

