import { MockCanteenMenuRepository } from "../../src/infrastructure/database/mock/MockCanteenMenuRepository";
import { AdminCreateOrUpdateMenuUseCase } from "../../src/application/admin/canteen/AdminCreateOrUpdateMenuUseCase";
import { AdminAddMenuItemUseCase } from "../../src/application/admin/canteen/AdminAddMenuItemUseCase";
import { AdminUpdateMenuItemUseCase } from "../../src/application/admin/canteen/AdminUpdateMenuItemUseCase";
import { AdminDeleteMenuItemUseCase } from "../../src/application/admin/canteen/AdminDeleteMenuItemUseCase";
import { AdminCopyWeekMenuUseCase } from "../../src/application/admin/canteen/AdminCopyWeekMenuUseCase";

describe("Admin Canteen Use Cases (Unit Tests)", () => {
  let repo: MockCanteenMenuRepository;

  beforeEach(() => {
    repo = new MockCanteenMenuRepository();
  });

  describe("AdminCreateOrUpdateMenuUseCase", () => {
    it("создает новое меню для указанной даты и приема пищи", async () => {
      const useCase = new AdminCreateOrUpdateMenuUseCase(repo);
      const testDate = new Date("2026-11-15T00:00:00Z");

      const result = await useCase.execute({
        date: testDate,
        mealType: "LUNCH",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value).toBeDefined();
      expect(result.value!.mealType).toBe("LUNCH");
      expect(result.value!.items).toEqual([]);

      // Проверяем, что меню сохранилось в репозитории
      const fetched = await repo.getByDateAndMealType(testDate, "LUNCH");
      expect(fetched.isSuccess).toBe(true);
      expect(fetched.value).not.toBeNull();
      expect(fetched.value!.id).toBe(result.value!.id);
    });

    it("возвращает существующее меню при повторном вызове для той же даты и приема пищи", async () => {
      const useCase = new AdminCreateOrUpdateMenuUseCase(repo);
      const testDate = new Date("2026-11-15T00:00:00Z");

      const res1 = await useCase.execute({ date: testDate, mealType: "BREAKFAST" });
      const res2 = await useCase.execute({ date: testDate, mealType: "BREAKFAST" });

      expect(res1.isSuccess).toBe(true);
      expect(res2.isSuccess).toBe(true);
      expect(res1.value!.id).toBe(res2.value!.id);
    });
  });

  describe("AdminAddMenuItemUseCase", () => {
    it("успешно добавляет блюдо с КБЖУ и аллергенами в меню", async () => {
      const createMenu = new AdminCreateOrUpdateMenuUseCase(repo);
      const menuRes = await createMenu.execute({
        date: new Date("2026-11-16T00:00:00Z"),
        mealType: "LUNCH",
      });
      const menuId = menuRes.value!.id;

      const addUseCase = new AdminAddMenuItemUseCase(repo);
      const itemRes = await addUseCase.execute({
        menuId,
        name: "Крем-суп из тыквы",
        description: "Нежный тыквенный суп со сливками",
        category: "Супы",
        calories: 190,
        protein: 4.5,
        fat: 8.0,
        carbs: 22.0,
        weight: 250,
        price: 150,
        isVegetarian: true,
        isVegan: false,
        allergens: ["молоко"],
      });

      expect(itemRes.isSuccess).toBe(true);
      expect(itemRes.value!.name).toBe("Крем-суп из тыквы");
      expect(itemRes.value!.allergens).toContain("молоко");
      expect(itemRes.value!.isVegetarian).toBe(true);

      const menu = await repo.findById(menuId);
      expect(menu.value!.items.length).toBe(1);
      expect(menu.value!.items[0].name).toBe("Крем-суп из тыквы");
    });

    it("возвращает ошибку, если меню не существует", async () => {
      const addUseCase = new AdminAddMenuItemUseCase(repo);
      const result = await addUseCase.execute({
        menuId: "non-existent-menu-id",
        name: "Компот",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Menu not found");
    });

    it("возвращает ошибку, если название блюда пустое", async () => {
      const createMenu = new AdminCreateOrUpdateMenuUseCase(repo);
      const menuRes = await createMenu.execute({
        date: new Date("2026-11-16T00:00:00Z"),
        mealType: "DINNER",
      });

      const addUseCase = new AdminAddMenuItemUseCase(repo);
      const result = await addUseCase.execute({
        menuId: menuRes.value!.id,
        name: "   ",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toContain("Dish name cannot be empty");
    });
  });

  describe("AdminUpdateMenuItemUseCase", () => {
    it("обновляет данные блюда (цену, калории, теги)", async () => {
      const createMenu = new AdminCreateOrUpdateMenuUseCase(repo);
      const menuRes = await createMenu.execute({
        date: new Date("2026-11-17T00:00:00Z"),
        mealType: "LUNCH",
      });
      const menuId = menuRes.value!.id;

      const addUseCase = new AdminAddMenuItemUseCase(repo);
      const itemRes = await addUseCase.execute({
        menuId,
        name: "Плов с курицей",
        price: 200,
        calories: 450,
      });

      const updateUseCase = new AdminUpdateMenuItemUseCase(repo);
      const updated = await updateUseCase.execute({
        id: itemRes.value!.id,
        menuId,
        name: "Плов с курицей и барбарисом",
        price: 220,
        calories: 480,
        isVegetarian: false,
        isVegan: false,
      });

      expect(updated.isSuccess).toBe(true);
      expect(updated.value!.name).toBe("Плов с курицей и барбарисом");
      expect(updated.value!.price).toBe(220);
      expect(updated.value!.calories).toBe(480);
    });
  });

  describe("AdminDeleteMenuItemUseCase", () => {
    it("удаляет блюдо из меню", async () => {
      const createMenu = new AdminCreateOrUpdateMenuUseCase(repo);
      const menuRes = await createMenu.execute({
        date: new Date("2026-11-18T00:00:00Z"),
        mealType: "BREAKFAST",
      });
      const menuId = menuRes.value!.id;

      const addUseCase = new AdminAddMenuItemUseCase(repo);
      const itemRes = await addUseCase.execute({
        menuId,
        name: "Сырники со сметаной",
      });

      const deleteUseCase = new AdminDeleteMenuItemUseCase(repo);
      const delRes = await deleteUseCase.execute(itemRes.value!.id);

      expect(delRes.isSuccess).toBe(true);

      const menu = await repo.findById(menuId);
      expect(menu.value!.items.find((i: { id: string }) => i.id === itemRes.value!.id)).toBeUndefined();
    });
  });

  describe("AdminCopyWeekMenuUseCase", () => {
    it("копирует рацион всей недели на следующую неделю с новыми id", async () => {
      const fromMonday = new Date("2026-11-09T00:00:00Z");
      const toMonday = new Date("2026-11-16T00:00:00Z");

      const createMenu = new AdminCreateOrUpdateMenuUseCase(repo);
      const addUseCase = new AdminAddMenuItemUseCase(repo);

      // Создаем меню на вторник прошлой недели
      const tuesday = new Date("2026-11-10T00:00:00Z");
      const m1 = await createMenu.execute({ date: tuesday, mealType: "LUNCH" });
      await addUseCase.execute({
        menuId: m1.value!.id,
        name: "Рассольник ленинградский",
        calories: 210,
        price: 130,
      });

      const copyUseCase = new AdminCopyWeekMenuUseCase(repo);
      const copyResult = await copyUseCase.execute({
        fromWeekStart: fromMonday,
        toWeekStart: toMonday,
      });

      expect(copyResult.isSuccess).toBe(true);
      expect(copyResult.value!.copiedMenusCount).toBeGreaterThanOrEqual(1);

      // Проверяем наличие меню на вторник целевой недели (2026-11-17)
      const targetTuesday = new Date("2026-11-17T00:00:00Z");
      const targetMenu = await repo.getByDateAndMealType(targetTuesday, "LUNCH");
      expect(targetMenu.isSuccess).toBe(true);
      expect(targetMenu.value).not.toBeNull();
      expect(targetMenu.value!.items.length).toBe(1);
      expect(targetMenu.value!.items[0].name).toBe("Рассольник ленинградский");
      // ID должен быть новым
      expect(targetMenu.value!.id).not.toBe(m1.value!.id);
    });
  });
});
