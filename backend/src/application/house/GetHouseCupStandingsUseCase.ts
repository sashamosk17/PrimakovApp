import { IHouseRepository, HouseStanding } from "../../domain/repositories/IHouseRepository";
import { HousePointTransaction } from "../../domain/entities/HousePointTransaction";
import { Result } from "../../shared/Result";

export interface HouseCupStandingsResponse {
  standings: HouseStanding[];
  recentTransactions: HousePointTransaction[];
}

export class GetHouseCupStandingsUseCase {
  constructor(private readonly houseRepository: IHouseRepository) {}

  public async execute(recentLimit: number = 20): Promise<Result<HouseCupStandingsResponse>> {
    try {
      const standings = await this.houseRepository.getHouseStandings();
      const recentTransactions = await this.houseRepository.getRecentTransactions(recentLimit);

      return Result.ok<HouseCupStandingsResponse>({
        standings,
        recentTransactions,
      });
    } catch (err: any) {
      return Result.fail(err.message || "Failed to retrieve house standings");
    }
  }
}

