/**
 * PostgreSQL implementation of IStoryRepository
 *
 * Handles story persistence with PostgreSQL database.
 * Manages story views through junction table (story_views).
 * Implements soft delete functionality.
 */

import { Pool } from "pg";
import { Story } from "../../../domain/entities/Story";
import { IStoryRepository } from "../../../domain/repositories/IStoryRepository";
import { Result } from "../../../shared/Result";

export class PostgresStoryRepository implements IStoryRepository {
  constructor(private readonly pool: Pool) {}

  async getAll(): Promise<Result<Story[]>> {
    try {
      const query = `
        SELECT s.id, s.title, s.description, s.image_url, s.video_url,
               s.author_id, s.created_at, s.expires_at, s.link_url, s.link_text,
               COALESCE(
                 array_agg(sv.user_id) FILTER (WHERE sv.user_id IS NOT NULL),
                 ARRAY[]::uuid[]
               ) as viewed_by
        FROM stories s
        LEFT JOIN story_views sv ON s.id = sv.story_id
        WHERE s.deleted_at IS NULL AND s.expires_at > NOW()
        GROUP BY s.id
        ORDER BY s.created_at DESC
      `;

      const result = await this.pool.query(query);
      const stories = result.rows.map((row) => this.mapRowToStory(row));

      return Result.ok(stories);
    } catch (error) {
      console.error("Error getting all stories:", error);
      return Result.fail("Failed to get stories");
    }
  }

  async getById(id: string): Promise<Result<Story | null>> {
    try {
      const query = `
        SELECT s.id, s.title, s.description, s.image_url, s.video_url,
               s.author_id, s.created_at, s.expires_at, s.link_url, s.link_text,
               COALESCE(
                 array_agg(sv.user_id) FILTER (WHERE sv.user_id IS NOT NULL),
                 ARRAY[]::uuid[]
               ) as viewed_by
        FROM stories s
        LEFT JOIN story_views sv ON s.id = sv.story_id
        WHERE s.id = $1 AND s.deleted_at IS NULL
        GROUP BY s.id
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const story = this.mapRowToStory(result.rows[0]);
      return Result.ok(story);
    } catch (error) {
      console.error("Error getting story by id:", error);
      return Result.fail("Failed to get story");
    }
  }

  async save(story: Story): Promise<Result<void>> {
    const client = await this.pool.connect();

    try {
      await client.query("BEGIN");

      // Check if story exists
      const existsQuery = "SELECT id FROM stories WHERE id = $1";
      const existsResult = await client.query(existsQuery, [story.id]);

      if (existsResult.rows.length > 0) {
        // Update existing story
        const updateQuery = `
          UPDATE stories
          SET title = $2,
              description = $3,
              image_url = $4,
              video_url = $5,
              author_id = $6,
              expires_at = $7
          WHERE id = $1
        `;

        await client.query(updateQuery, [
          story.id,
          story.title,
          story.description,
          story.imageUrl || null,
          story.videoUrl || null,
          story.author || null,
          story.expiresAt,
        ]);

        // Delete existing views
        await client.query("DELETE FROM story_views WHERE story_id = $1", [story.id]);
      } else {
        // Insert new story
        const insertQuery = `
          INSERT INTO stories (id, title, description, image_url, video_url, author_id, created_at, expires_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        `;

        await client.query(insertQuery, [
          story.id,
          story.title,
          story.description,
          story.imageUrl || null,
          story.videoUrl || null,
          story.author || null,
          story.createdAt,
          story.expiresAt,
        ]);
      }

      // Insert story views
      for (const userId of story.viewedBy) {
        await this.saveStoryView(client, story.id, userId);
      }

      await client.query("COMMIT");
      return Result.ok();
    } catch (error) {
      await client.query("ROLLBACK");
      console.error("Error saving story:", error);
      return Result.fail("Failed to save story");
    } finally {
      client.release();
    }
  }

  async markAsViewed(storyId: string, userId: string): Promise<Result<void>> {
    try {
      const query = `
        INSERT INTO story_views (story_id, user_id, viewed_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (story_id, user_id) DO NOTHING
      `;

      await this.pool.query(query, [storyId, userId]);
      return Result.ok();
    } catch (error) {
      console.error("Error marking story as viewed:", error);
      return Result.fail("Failed to mark story as viewed");
    }
  }

  /**
   * Save a story view record
   */
  private async saveStoryView(client: any, storyId: string, userId: string): Promise<void> {
    const query = `
      INSERT INTO story_views (story_id, user_id, viewed_at)
      VALUES ($1, $2, NOW())
      ON CONFLICT (story_id, user_id) DO NOTHING
    `;

    await client.query(query, [storyId, userId]);
  }

  /**
   * Map database row to Story entity
   * Converts viewed_by array from junction table to domain model format
   */
  private mapRowToStory(row: any): Story {
    return {
      id: row.id,
      title: row.title,
      description: row.description,
      imageUrl: row.image_url,
      videoUrl: row.video_url,
      createdAt: new Date(row.created_at),
      expiresAt: new Date(row.expires_at),
      viewedBy: row.viewed_by || [],
      author: row.author_id,
      linkUrl: row.link_url,
      linkText: row.link_text,
    };
  }
}
