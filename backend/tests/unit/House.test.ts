import { HousePointTransaction } from "../../src/domain/entities/HousePointTransaction";
import { MockHouseRepository } from "../../src/infrastructure/database/memory/MockHouseRepository";
import { GetHouseCupStandingsUseCase } from "../../src/application/house/GetHouseCupStandingsUseCase";
import { AwardHousePointsUseCase } from "../../src/application/house/AwardHousePointsUseCase";

describe("House System Domain & Use Cases", () => {
  let houseRepository: MockHouseRepository;

  beforeEach(() => {
    houseRepository = new MockHouseRepository();
  });

  describe("HousePointTransaction Entity", () => {
    it("should instantiate transaction with valid values", () => {
      const tx = new HousePointTransaction(
        "tx-1",
        "NORTH",
        50,
        "OLYMPIAD",
        "1 место на региональном этапе ВсОШ по физике",
        "teacher-1",
        "student-1",
        new Date("2026-10-20T10:00:00Z")
      );

      expect(tx.id).toBe("tx-1");
      expect(tx.house).toBe("NORTH");
      expect(tx.points).toBe(50);
      expect(tx.category).toBe("OLYMPIAD");
      expect(tx.reason).toContain("ВсОШ");
    });

    it("should reject negative or zero points", () => {
      expect(() => {
        new HousePointTransaction(
          "tx-bad",
          "SOUTH",
          -10,
          "SPORTS",
          "Нарушение",
          "teacher-1"
        );
      }).toThrow();
    });
  });

  describe("AwardHousePointsUseCase", () => {
    it("should successfully award points and persist transaction", async () => {
      const useCase = new AwardHousePointsUseCase(houseRepository);

      const result = await useCase.execute({
        house: "WEST",
        points: 30,
        category: "CULTURE",
        reason: "Победа в театральном фестивале",
        awardedBy: "teacher-1",
        studentId: "student-1",
      });

      expect(result.isSuccess).toBe(true);
      expect(result.value.house).toBe("WEST");
      expect(result.value.points).toBe(30);

      const standings = await houseRepository.getHouseStandings();
      const west = standings.find((s: { house: string }) => s.house === "WEST");
      expect(west?.totalPoints).toBe(30);
    });

    it("should fail when points are invalid or house is invalid", async () => {
      const useCase = new AwardHousePointsUseCase(houseRepository);

      const result = await useCase.execute({
        house: "INVALID_HOUSE" as any,
        points: 10,
        category: "SPORTS",
        reason: "Тест",
        awardedBy: "teacher-1",
      });

      expect(result.isFailure).toBe(true);
      expect(result.error).toBeDefined();
    });
  });

  describe("GetHouseCupStandingsUseCase", () => {
    it("should calculate house ranks accurately and sort from highest to lowest", async () => {
      await houseRepository.addPoints(
        new HousePointTransaction("t1", "NORTH", 100, "OLYMPIAD", "ВсОШ", "t-1")
      );
      await houseRepository.addPoints(
        new HousePointTransaction("t2", "SOUTH", 250, "SPORTS", "Спартакиада", "t-1")
      );
      await houseRepository.addPoints(
        new HousePointTransaction("t3", "WEST", 180, "CULTURE", "Театр", "t-1")
      );
      await houseRepository.addPoints(
        new HousePointTransaction("t4", "EAST", 90, "CHARITY", "Ярмарка", "t-1")
      );

      const useCase = new GetHouseCupStandingsUseCase(houseRepository);
      const result = await useCase.execute();

      expect(result.isSuccess).toBe(true);
      const { standings, recentTransactions } = result.value;

      expect(standings.length).toBe(4);
      expect(standings[0].house).toBe("SOUTH");
      expect(standings[0].rank).toBe(1);
      expect(standings[0].totalPoints).toBe(250);

      expect(standings[1].house).toBe("WEST");
      expect(standings[1].rank).toBe(2);

      expect(standings[2].house).toBe("NORTH");
      expect(standings[2].rank).toBe(3);

      expect(standings[3].house).toBe("EAST");
      expect(standings[3].rank).toBe(4);

      expect(recentTransactions.length).toBe(4);
    });
  });
});

