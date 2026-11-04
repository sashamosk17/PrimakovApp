import { MockBoardingRepository } from "../../src/infrastructure/database/memory/MockBoardingRepository";
import { MockAuditRepository } from "../../src/infrastructure/database/memory/MockAuditRepository";
import { BoardingCurfewWorker } from "../../src/application/boarding/BoardingCurfewWorker";
import { AllergenSafetyGuard } from "../../src/application/canteen/AllergenSafetyGuard";
import { MenuItem } from "../../src/domain/repositories/ICanteenMenuRepository";
import { BoardingCheckIn } from "../../src/domain/entities/BoardingCheckIn";

describe("Campus & Boarding Controls (Curfew Watchdog & Allergen Safety Guard)", () => {
  describe("BoardingCurfewWorker Watchdog", () => {
    let boardingRepo: MockBoardingRepository;
    let auditRepo: MockAuditRepository;
    let curfewWorker: BoardingCurfewWorker;

    beforeEach(() => {
      boardingRepo = new MockBoardingRepository();
      auditRepo = new MockAuditRepository();
      curfewWorker = new BoardingCurfewWorker(boardingRepo, auditRepo);
    });

    afterEach(() => {
      curfewWorker.stop();
    });

    it("detects unaccounted student absences at curfew and logs security alerts", async () => {
      // Add one present student and one absent student without leave
      await boardingRepo.checkIn(
        new BoardingCheckIn("chk-1", "student-p-1", new Date(), "PRESENT")
      );
      await boardingRepo.checkIn(
        new BoardingCheckIn("chk-2", "student-absent-1", new Date(), "ABSENT", "Не вернулся в кампус")
      );

      const result = await curfewWorker.tick();

      expect(result.isSuccess).toBe(true);
      expect(result.value.totalBoardingStudents).toBe(2);
      expect(result.value.presentCount).toBe(1);
      expect(result.value.unaccountedAbsences.length).toBe(1);

      const missing = result.value.unaccountedAbsences[0];
      expect(missing.studentId).toBe("student-absent-1");

      // Verify audit log entry was generated
      const logs = (await auditRepo.getRecent()).value || [];
      const curfewLog = logs.find(
        (l) => l.action === "BOARDING_CURFEW_VIOLATION" && l.entityId === "student-absent-1"
      );
      expect(curfewLog).toBeDefined();
      expect(curfewLog?.details?.status).toBe("ABSENT");
    });
  });

  describe("AllergenSafetyGuard Domain Service", () => {
    const safetyGuard = new AllergenSafetyGuard();

    const nutSalad: MenuItem = {
      id: "dish-1",
      menuId: "menu-1",
      name: "Салат Вальдорф с грецким орехом",
      isVegetarian: true,
      isVegan: false,
      allergens: ["Орехи", "Сельдерей"],
      displayOrder: 1,
      createdAt: new Date(),
    };

    const cheeseCake: MenuItem = {
      id: "dish-2",
      menuId: "menu-1",
      name: "Сырники из рикотты",
      isVegetarian: true,
      isVegan: false,
      allergens: ["Лактоза", "Глютен"],
      displayOrder: 2,
      createdAt: new Date(),
    };

    const safePorridge: MenuItem = {
      id: "dish-3",
      menuId: "menu-1",
      name: "Гречневая каша на воде с грибами",
      isVegetarian: true,
      isVegan: true,
      allergens: [],
      displayOrder: 3,
      createdAt: new Date(),
    };

    it("blocks dish selection when student has matching allergen restriction", () => {
      const studentAllergies = ["Орехи"];

      const check = safetyGuard.checkSafety(studentAllergies, [nutSalad]);
      expect(check.isFailure).toBe(true);
      expect(check.error).toContain("Салат Вальдорф с грецким орехом");
      expect(check.error).toContain("Орехи");
    });

    it("handles cross-lingual and case-insensitive allergen matching (e.g. 'nuts' vs 'Орехи', 'lactose' vs 'Лактоза')", () => {
      const studentAllergiesEnglish = ["lactose"];

      const check = safetyGuard.checkSafety(studentAllergiesEnglish, [cheeseCake]);
      expect(check.isFailure).toBe(true);
      expect(check.error).toContain("Сырники из рикотты");
    });

    it("approves allergen-safe orders successfully", () => {
      const studentAllergies = ["Рыба", "Арахис"];

      const check = safetyGuard.checkSafety(studentAllergies, [safePorridge, cheeseCake]);
      expect(check.isSuccess).toBe(true);
    });

    it("approves dishes when student has no registered allergies", () => {
      const check = safetyGuard.checkSafety([], [nutSalad, cheeseCake]);
      expect(check.isSuccess).toBe(true);
    });
  });
});
