import { randomUUID } from "crypto";
import { HousePointTransaction, HouseName, HouseCategory } from "../../domain/entities/HousePointTransaction";
import { IHouseRepository } from "../../domain/repositories/IHouseRepository";
import { Result } from "../../shared/Result";

export interface AwardHousePointsRequest {
  house: HouseName;
  points: number;
  category: HouseCategory;
  reason: string;
  awardedBy: string;
  studentId?: string;
}

export class AwardHousePointsUseCase {
  constructor(private readonly houseRepository: IHouseRepository) {}

  public async execute(request: AwardHousePointsRequest): Promise<Result<HousePointTransaction>> {
    try {
      const validHouses: HouseName[] = ["NORTH", "SOUTH", "EAST", "WEST"];
      if (!validHouses.includes(request.house)) {
        return Result.fail(`Invalid house: ${request.house}. Must be NORTH, SOUTH, EAST, or WEST.`);
      }

      if (!request.points || request.points <= 0) {
        return Result.fail("Points must be a positive number");
      }

      if (!request.reason || !request.reason.trim()) {
        return Result.fail("Reason is required");
      }

      const transaction = new HousePointTransaction(
        randomUUID(),
        request.house,
        Math.floor(request.points),
        request.category,
        request.reason.trim(),
        request.awardedBy,
        request.studentId,
        new Date()
      );

      await this.houseRepository.addPoints(transaction);

      return Result.ok<HousePointTransaction>(transaction);
    } catch (err: any) {
      return Result.fail(err.message || "Failed to award house points");
    }
  }
}

