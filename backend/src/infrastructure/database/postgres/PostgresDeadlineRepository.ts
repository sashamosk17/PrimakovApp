/**
 * PostgreSQL implementation of IDeadlineRepository
 *
 * Handles deadline persistence with PostgreSQL database.
 */

import { Pool } from "pg";
import { Deadline } from "../../../domain/entities/Deadline";
import { IDeadlineRepository } from "../../../domain/repositories/IDeadlineRepository";
import { Result } from "../../../shared/Result";
import { DeadlineStatus } from "../../../domain/value-objects/DeadlineStatus";

export class PostgresDeadlineRepository implements IDeadlineRepository {
  constructor(private readonly pool: Pool) {}

  async getByUser(userId: string): Promise<Result<Deadline[]>> {
    try {
      const query = `
        SELECT id, user_id, title, description, subject, due_date, status,
               completed_at, created_at, updated_at
        FROM deadlines
        WHERE user_id = $1
        ORDER BY due_date ASC
      `;

      const result = await this.pool.query(query, [userId]);
      const deadlines = result.rows.map((row) => this.mapRowToDeadline(row));

      return Result.ok(deadlines);
    } catch (error) {
      console.error("Error getting deadlines by user:", error);
      return Result.fail("Failed to get deadlines");
    }
  }

  async findById(id: string): Promise<Deadline | undefined> {
    try {
      const query = `
        SELECT id, user_id, title, description, subject, due_date, status,
               completed_at, created_at, updated_at
        FROM deadlines
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return undefined;
      }

      return this.mapRowToDeadline(result.rows[0]);
    } catch (error) {
      console.error("Error finding deadline by id:", error);
      return undefined;
    }
  }

  async save(deadline: Deadline): Promise<Result<void>> {
    try {
      const query = `
        INSERT INTO deadlines (id, user_id, title, description, subject, due_date, status,
                              completed_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
      `;

      await this.pool.query(query, [
        deadline.id,
        deadline.userId,
        deadline.title,
        deadline.description,
        deadline.subject || null,
        deadline.dueDate,
        deadline.status,
        deadline.completedAt || null,
        deadline.createdAt,
        deadline.updatedAt,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error saving deadline:", error);
      return Result.fail("Failed to save deadline");
    }
  }

  async update(deadline: Deadline): Promise<Result<void>> {
    try {
      const query = `
        UPDATE deadlines
        SET title = $2,
            description = $3,
            subject = $4,
            due_date = $5,
            status = $6,
            completed_at = $7,
            updated_at = NOW()
        WHERE id = $1
      `;

      await this.pool.query(query, [
        deadline.id,
        deadline.title,
        deadline.description,
        deadline.subject || null,
        deadline.dueDate,
        deadline.status,
        deadline.completedAt || null,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error updating deadline:", error);
      return Result.fail("Failed to update deadline");
    }
  }

  /**
   * Map database row to Deadline entity
   */
  private mapRowToDeadline(row: any): Deadline {
    return new Deadline(
      row.id,
      row.title,
      row.description,
      new Date(row.due_date),
      row.user_id,
      row.status as DeadlineStatus,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.completed_at ? new Date(row.completed_at) : undefined,
      row.subject
    );
  }
}
