/**
 * PostgreSQL implementation of IScheduleRepository
 *
 * Handles schedule and lesson persistence with PostgreSQL database.
 * Manages the one-to-many relationship between schedules and lessons.
 */

import { Pool } from "pg";
import { Schedule } from "../../../domain/entities/Schedule";
import { Lesson } from "../../../domain/entities/Lesson";
import { IScheduleRepository } from "../../../domain/repositories/IScheduleRepository";
import { Result } from "../../../shared/Result";
import { TimeSlot } from "../../../domain/value-objects/TimeSlot";
import { Room } from "../../../domain/value-objects/Room";

export class PostgresScheduleRepository implements IScheduleRepository {
  constructor(private readonly pool: Pool) {}

  async getScheduleByGroup(groupId: string): Promise<Result<Schedule | null>> {
    // Note: groupId is actually userId in current implementation
    try {
      const scheduleQuery = `
        SELECT id, user_id, date, created_at, updated_at
        FROM schedules
        WHERE user_id = $1
        ORDER BY date DESC
        LIMIT 1
      `;

      const scheduleResult = await this.pool.query(scheduleQuery, [groupId]);

      if (scheduleResult.rows.length === 0) {
        return Result.ok(null);
      }

      const scheduleRow = scheduleResult.rows[0];
      const lessons = await this.getLessonsByScheduleId(scheduleRow.id);

      const schedule = new Schedule(
        scheduleRow.id,
        scheduleRow.user_id,
        new Date(scheduleRow.date),
        lessons,
        new Date(scheduleRow.created_at),
        new Date(scheduleRow.updated_at)
      );

      return Result.ok(schedule);
    } catch (error) {
      console.error("Error getting schedule by group:", error);
      return Result.fail("Failed to get schedule");
    }
  }

  async getScheduleByDate(groupId: string, date: Date): Promise<Result<Schedule | null>> {
    try {
      // Format date as YYYY-MM-DD for comparison
      const dateString = date.toISOString().split("T")[0];

      const scheduleQuery = `
        SELECT id, user_id, date, created_at, updated_at
        FROM schedules
        WHERE user_id = $1 AND date = $2
      `;

      const scheduleResult = await this.pool.query(scheduleQuery, [groupId, dateString]);

      if (scheduleResult.rows.length === 0) {
        return Result.ok(null);
      }

      const scheduleRow = scheduleResult.rows[0];
      const lessons = await this.getLessonsByScheduleId(scheduleRow.id);

      const schedule = new Schedule(
        scheduleRow.id,
        scheduleRow.user_id,
        new Date(scheduleRow.date),
        lessons,
        new Date(scheduleRow.created_at),
        new Date(scheduleRow.updated_at)
      );

      return Result.ok(schedule);
    } catch (error) {
      console.error("Error getting schedule by date:", error);
      return Result.fail("Failed to get schedule");
    }
  }

  async getScheduleByUserId(userId: string, date: Date): Promise<Result<Schedule | null>> {
    // In PostgreSQL implementation groupId column stores userId, so this is equivalent
    return this.getScheduleByDate(userId, date);
  }

  async save(schedule: Schedule): Promise<Result<void>> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Check if schedule exists
      const existsQuery = "SELECT id FROM schedules WHERE id = $1";
      const existsResult = await client.query(existsQuery, [schedule.id]);

      if (existsResult.rows.length > 0) {
        // Update existing schedule
        const updateQuery = `
          UPDATE schedules
          SET user_id = $2,
              date = $3,
              updated_at = NOW()
          WHERE id = $1
        `;

        await client.query(updateQuery, [
          schedule.id,
          schedule.groupId,
          schedule.date.toISOString().split("T")[0],
        ]);

        // Delete existing lessons
        await client.query("DELETE FROM lessons WHERE schedule_id = $1", [schedule.id]);
      } else {
        // Insert new schedule
        const insertQuery = `
          INSERT INTO schedules (id, user_id, date, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `;

        await client.query(insertQuery, [
          schedule.id,
          schedule.groupId,
          schedule.date.toISOString().split("T")[0],
          schedule.createdAt,
          schedule.updatedAt,
        ]);
      }

      // Insert lessons
      for (const lesson of schedule.lessons) {
        await this.saveLesson(client, lesson, schedule.id);
      }

      await client.query("COMMIT");
      return Result.ok();
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving schedule:", error);
      return Result.fail("Failed to save schedule");
    } finally {
      client.release();
    }
  }

  /**
   * Get all lessons for a schedule
   */
  private async getLessonsByScheduleId(scheduleId: string): Promise<Lesson[]> {
    const query = `
      SELECT id, schedule_id, subject, teacher_id, start_time, end_time,
             room_number, room_building, floor, has_homework, homework_description, created_at
      FROM lessons
      WHERE schedule_id = $1
      ORDER BY start_time
    `;

    const result = await this.pool.query(query, [scheduleId]);
    return result.rows.map((row) => this.mapRowToLesson(row));
  }

  /**
   * Save a single lesson
   */
  private async saveLesson(client: any, lesson: Lesson, scheduleId: string): Promise<void> {
    const query = `
      INSERT INTO lessons (id, schedule_id, subject, teacher_id, start_time, end_time,
                          room_number, room_building, floor, has_homework, homework_description, created_at)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())
    `;

    await client.query(query, [
      lesson.id,
      scheduleId,
      lesson.subject,
      lesson.teacherId,
      lesson.timeSlot.startTime,
      lesson.timeSlot.endTime,
      lesson.room.number,
      lesson.room.building,
      lesson.room.floor,
      lesson.hasHomework,
      lesson.homeworkDescription || null,
    ]);
  }

  /**
   * Map database row to Lesson entity
   * Reconstructs TimeSlot and Room value objects
   */
  private mapRowToLesson(row: any): Lesson {
    const timeSlotResult = TimeSlot.create(row.start_time, row.end_time);
    if (timeSlotResult.isFailure) {
      throw new Error(`Invalid time slot in database: ${row.start_time} - ${row.end_time}`);
    }

    const roomBuilding = row.room_building || 'A';
    const roomFloor = row.floor ?? 1;
    const roomResult = Room.create(row.room_number || '0', roomBuilding, roomFloor);
    if (roomResult.isFailure) {
      throw new Error(`Invalid room in database: ${row.room_number}`);
    }

    return new Lesson(
      row.id,
      row.subject,
      row.teacher_id,
      timeSlotResult.value,
      roomResult.value,
      roomFloor,
      row.has_homework,
      row.homework_description || undefined
    );
  }
}
