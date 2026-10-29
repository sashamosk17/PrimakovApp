/**
 * PostgreSQL implementation of IRoomRepository
 *
 * Handles room/classroom persistence with PostgreSQL database.
 * Used for campus navigation and schedule management.
 */

import { Pool } from "pg";
import { Result } from "../../../shared/Result";
import { Room, IRoomRepository } from "../../../domain/repositories/IRoomRepository";
export { Room, IRoomRepository };

export class PostgresRoomRepository implements IRoomRepository {
  constructor(private readonly pool: Pool) {}

  async getAll(): Promise<Result<Room[]>> {
    try {
      const query = `
        SELECT id, number, name, building, floor, capacity, latitude, longitude,
               description, is_active, created_at, updated_at
        FROM rooms
        WHERE is_active = true
        ORDER BY building, floor, number
      `;

      const result = await this.pool.query(query);
      const rooms = result.rows.map((row) => this.mapRowToRoom(row));

      return Result.ok(rooms);
    } catch (error) {
      console.error("Error getting all rooms:", error);
      return Result.fail("Failed to get rooms");
    }
  }

  async getById(id: string): Promise<Result<Room | null>> {
    try {
      const query = `
        SELECT id, number, name, building, floor, capacity, latitude, longitude,
               description, is_active, created_at, updated_at
        FROM rooms
        WHERE id = $1
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const room = this.mapRowToRoom(result.rows[0]);
      return Result.ok(room);
    } catch (error) {
      console.error("Error getting room by id:", error);
      return Result.fail("Failed to get room");
    }
  }

  async getByNumber(number: string): Promise<Result<Room | null>> {
    try {
      const query = `
        SELECT id, number, name, building, floor, capacity, latitude, longitude,
               description, is_active, created_at, updated_at
        FROM rooms
        WHERE number = $1 AND is_active = true
      `;

      const result = await this.pool.query(query, [number]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const room = this.mapRowToRoom(result.rows[0]);
      return Result.ok(room);
    } catch (error) {
      console.error("Error getting room by number:", error);
      return Result.fail("Failed to get room");
    }
  }

  async getByBuilding(building: string): Promise<Result<Room[]>> {
    try {
      const query = `
        SELECT id, number, name, building, floor, capacity, latitude, longitude,
               description, is_active, created_at, updated_at
        FROM rooms
        WHERE building = $1 AND is_active = true
        ORDER BY floor, number
      `;

      const result = await this.pool.query(query, [building]);
      const rooms = result.rows.map((row) => this.mapRowToRoom(row));

      return Result.ok(rooms);
    } catch (error) {
      console.error("Error getting rooms by building:", error);
      return Result.fail("Failed to get rooms");
    }
  }

  async getByFloor(building: string, floor: number): Promise<Result<Room[]>> {
    try {
      const query = `
        SELECT id, number, name, building, floor, capacity, latitude, longitude,
               description, is_active, created_at, updated_at
        FROM rooms
        WHERE building = $1 AND floor = $2 AND is_active = true
        ORDER BY number
      `;

      const result = await this.pool.query(query, [building, floor]);
      const rooms = result.rows.map((row) => this.mapRowToRoom(row));

      return Result.ok(rooms);
    } catch (error) {
      console.error("Error getting rooms by floor:", error);
      return Result.fail("Failed to get rooms");
    }
  }

  async save(room: Room): Promise<Result<void>> {
    try {
      const query = `
        INSERT INTO rooms (id, number, name, building, floor, capacity, latitude, longitude,
                          description, is_active, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      `;

      await this.pool.query(query, [
        room.id,
        room.number,
        room.name || null,
        room.building,
        room.floor,
        room.capacity || null,
        room.latitude || null,
        room.longitude || null,
        room.description || null,
        room.isActive,
        room.createdAt,
        room.updatedAt,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error saving room:", error);
      return Result.fail("Failed to save room");
    }
  }

  async update(room: Room): Promise<Result<void>> {
    try {
      const query = `
        UPDATE rooms
        SET number = $2,
            name = $3,
            building = $4,
            floor = $5,
            capacity = $6,
            latitude = $7,
            longitude = $8,
            description = $9,
            is_active = $10,
            updated_at = NOW()
        WHERE id = $1
      `;

      await this.pool.query(query, [
        room.id,
        room.number,
        room.name || null,
        room.building,
        room.floor,
        room.capacity || null,
        room.latitude || null,
        room.longitude || null,
        room.description || null,
        room.isActive,
      ]);

      return Result.ok();
    } catch (error) {
      console.error("Error updating room:", error);
      return Result.fail("Failed to update room");
    }
  }

  /**
   * Map database row to Room object
   */
  private mapRowToRoom(row: any): Room {
    return {
      id: row.id,
      number: row.number,
      name: row.name,
      building: row.building,
      floor: row.floor,
      capacity: row.capacity,
      latitude: row.latitude ? parseFloat(row.latitude) : undefined,
      longitude: row.longitude ? parseFloat(row.longitude) : undefined,
      description: row.description,
      isActive: row.is_active,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }
}
