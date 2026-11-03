import { HousePointTransaction } from "../entities/HousePointTransaction";

export interface HouseStanding {
  house: string;
  totalPoints: number;
  rank: number;
}

export interface IHouseRepository {
  getHouseStandings(): Promise<HouseStanding[]>;
  addPoints(transaction: HousePointTransaction): Promise<void>;
  getRecentTransactions(limit: number): Promise<HousePointTransaction[]>;
}

