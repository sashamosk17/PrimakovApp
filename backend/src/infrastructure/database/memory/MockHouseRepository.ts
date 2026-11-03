import { HousePointTransaction, HouseName } from "../../../domain/entities/HousePointTransaction";
import { IHouseRepository, HouseStanding } from "../../../domain/repositories/IHouseRepository";

export class MockHouseRepository implements IHouseRepository {
  private transactions: HousePointTransaction[] = [];

  async addPoints(transaction: HousePointTransaction): Promise<void> {
    this.transactions.push(transaction);
  }

  async getRecentTransactions(limit: number = 20): Promise<HousePointTransaction[]> {
    return [...this.transactions]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async getHouseStandings(): Promise<HouseStanding[]> {
    const validHouses: HouseName[] = ["NORTH", "SOUTH", "EAST", "WEST"];
    const totals: Record<HouseName, number> = {
      NORTH: 0,
      SOUTH: 0,
      EAST: 0,
      WEST: 0,
    };

    for (const tx of this.transactions) {
      if (totals[tx.house] !== undefined) {
        totals[tx.house] += tx.points;
      }
    }

    const standings = validHouses.map((house) => ({
      house,
      totalPoints: totals[house],
      rank: 0,
    }));

    // Sort descending by points
    standings.sort((a, b) => b.totalPoints - a.totalPoints);

    standings.forEach((s, idx) => {
      s.rank = idx + 1;
    });

    return standings;
  }

  clear(): void {
    this.transactions = [];
  }
}

