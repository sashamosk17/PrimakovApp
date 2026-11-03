import { Pool } from "pg";
import { HousePointTransaction, HouseName, HouseCategory } from "../../../domain/entities/HousePointTransaction";
import { IHouseRepository, HouseStanding } from "../../../domain/repositories/IHouseRepository";

export class PostgresHouseRepository implements IHouseRepository {
  constructor(private readonly pool: Pool) {}

  async addPoints(transaction: HousePointTransaction): Promise<void> {
    const query = `
      INSERT INTO house_point_transactions (id, house, points, category, reason, awarded_by, student_id, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    `;
    await this.pool.query(query, [
      transaction.id,
      transaction.house,
      transaction.points,
      transaction.category,
      transaction.reason,
      transaction.awardedBy,
      transaction.studentId || null,
      transaction.createdAt,
    ]);
  }

  async getRecentTransactions(limit: number = 20): Promise<HousePointTransaction[]> {
    const query = `
      SELECT id, house, points, category, reason, awarded_by, student_id, created_at
      FROM house_point_transactions
      ORDER BY created_at DESC
      LIMIT $1
    `;
    const res = await this.pool.query(query, [limit]);
    return res.rows.map(this.mapRowToTransaction);
  }

  async getHouseStandings(): Promise<HouseStanding[]> {
    const query = `
      SELECT 
        h.house,
        COALESCE(SUM(t.points), 0)::INTEGER as total_points
      FROM (
        VALUES ('NORTH'), ('SOUTH'), ('EAST'), ('WEST')
      ) AS h(house)
      LEFT JOIN house_point_transactions t ON t.house = h.house
      GROUP BY h.house
      ORDER BY total_points DESC
    `;
    const res = await this.pool.query(query);

    return res.rows.map((row, idx) => ({
      house: row.house,
      totalPoints: parseInt(row.total_points, 10) || 0,
      rank: idx + 1,
    }));
  }

  private mapRowToTransaction(row: any): HousePointTransaction {
    return new HousePointTransaction(
      row.id,
      row.house as HouseName,
      parseInt(row.points, 10),
      row.category as HouseCategory,
      row.reason,
      row.awarded_by,
      row.student_id || undefined,
      new Date(row.created_at)
    );
  }
}

