/**
 * PostgreSQL implementation of IRequestRepository
 *
 * Handles IT, maintenance, and cleaning request tickets.
 */

import { Pool } from "pg";
import { Result } from "../../../shared/Result";
import {
  Request,
  RequestType,
  RequestStatus,
  RequestPriority,
  IRequestRepository,
} from "../../../domain/repositories/IRequestRepository";
export { Request, RequestType, RequestStatus, RequestPriority, IRequestRepository };

export class PostgresRequestRepository implements IRequestRepository {
  constructor(private readonly pool: Pool) {}

  async getAll(): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        ORDER BY priority DESC, created_at DESC
      `;

      const result = await this.pool.query(query);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting all requests:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getById(id: string): Promise<Result<Request | null>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const request = this.mapRowToRequest(result.rows[0]);
      return Result.ok(request);
    } catch (error) {
      console.error("Error getting request by id:", error);
      return Result.fail("Failed to get request");
    }
  }

  async getByCreator(creatorId: string): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE creator_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [creatorId]);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting requests by creator:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getByAssignee(assigneeId: string): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE assignee_id = $1
        ORDER BY priority DESC, created_at ASC
      `;

      const result = await this.pool.query(query, [assigneeId]);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting requests by assignee:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getByStatus(status: RequestStatus): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE status = $1
        ORDER BY priority DESC, created_at ASC
      `;

      const result = await this.pool.query(query, [status]);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting requests by status:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getByType(type: RequestType): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE type = $1
        ORDER BY priority DESC, created_at DESC
      `;

      const result = await this.pool.query(query, [type]);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting requests by type:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getByRoom(roomId: string): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE room_id = $1
        ORDER BY created_at DESC
      `;

      const result = await this.pool.query(query, [roomId]);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting requests by room:", error);
      return Result.fail("Failed to get requests");
    }
  }

  async getActive(): Promise<Result<Request[]>> {
    try {
      const query = `
        SELECT id, type, title, description, status, priority, creator_id, assignee_id,
               room_id, created_at, updated_at, completed_at, notes
        FROM requests
        WHERE status NOT IN ('COMPLETED', 'CANCELLED')
        ORDER BY priority DESC, created_at ASC
      `;

      const result = await this.pool.query(query);
      const requests = result.rows.map((row) => this.mapRowToRequest(row));

      return Result.ok(requests);
    } catch (error) {
      console.error("Error getting active requests:", error);
      return Result.fail("Failed to get active requests");
    }
  }

  async save(request: Request): Promise<Result<void>> {
    try {
      const query = `
        INSERT INTO requests (id, type, title, description, status, priority, creator_id,
                             assignee_id, room_id, created_at, updated_at, completed_at, notes)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      `;

      await this.pool.query(query, [
        request.id,
        request.type,
        request.title,
        request.description,
        request.status,
        request.priority,
        request.creatorId,
        request.assigneeId || null,
        request.roomId || null,
        request.createdAt,
        request.updatedAt,
        request.completedAt || null,
        request.notes || null,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error saving request:", error);
      return Result.fail("Failed to save request");
    }
  }

  async update(request: Request): Promise<Result<void>> {
    try {
      const query = `
        UPDATE requests
        SET type = $2,
            title = $3,
            description = $4,
            status = $5,
            priority = $6,
            assignee_id = $7,
            room_id = $8,
            completed_at = $9,
            notes = $10,
            updated_at = NOW()
        WHERE id = $1
      `;

      await this.pool.query(query, [
        request.id,
        request.type,
        request.title,
        request.description,
        request.status,
        request.priority,
        request.assigneeId || null,
        request.roomId || null,
        request.completedAt || null,
        request.notes || null,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error updating request:", error);
      return Result.fail("Failed to update request");
    }
  }

  /**
   * Map database row to Request object
   */
  private mapRowToRequest(row: any): Request {
    return {
      id: row.id,
      type: row.type as RequestType,
      title: row.title,
      description: row.description,
      status: row.status as RequestStatus,
      priority: row.priority as RequestPriority,
      creatorId: row.creator_id,
      assigneeId: row.assignee_id,
      roomId: row.room_id,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      completedAt: row.completed_at ? new Date(row.completed_at) : undefined,
      notes: row.notes,
    };
  }
}
