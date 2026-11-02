/**
 * PostgreSQL implementation of IUserRepository
 *
 * Handles user persistence with PostgreSQL database.
 * Maps between database rows and User domain entities.
 */

import { Pool } from "pg";
import { User } from "../../../domain/entities/User";
import { IUserRepository, UserFilter, PaginatedUsers } from "../../../domain/repositories/IUserRepository";
import { Result } from "../../../shared/Result";
import { Email } from "../../../domain/value-objects/Email";
import { Password } from "../../../domain/value-objects/Password";
import { Role } from "../../../shared/types";

export class PostgresUserRepository implements IUserRepository {
  constructor(private readonly pool: Pool) { }

  async findById(id: string): Promise<Result<User | null>> {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, role, group_name,
               is_active, vk_id, avatar_url, two_factor_enabled, created_at, updated_at
        FROM users
        WHERE id = $1 AND deleted_at IS NULL
      `;

      const result = await this.pool.query(query, [id]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const user = this.mapRowToUser(result.rows[0]);
      return Result.ok(user);
    } catch (error) {
      console.error("Error finding user by id:", error);
      return Result.fail("Failed to find user");
    }
  }

  async findByEmail(email: string): Promise<Result<User | null>> {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, role, group_name,
               is_active, vk_id, avatar_url, two_factor_enabled, created_at, updated_at
        FROM users
        WHERE email = $1 AND deleted_at IS NULL
      `;

      const result = await this.pool.query(query, [email.toLowerCase()]);

      if (result.rows.length === 0) {
        return Result.ok(null);
      }

      const user = this.mapRowToUser(result.rows[0]);
      return Result.ok(user);
    } catch (error) {
      console.error("Error finding user by email:", error);
      return Result.fail("Failed to find user");
    }
  }

  async findByRole(role: Role): Promise<Result<User[]>> {
    try {
      const query = `
        SELECT id, email, password_hash, first_name, last_name, role, group_name,
               is_active, vk_id, avatar_url, two_factor_enabled, created_at, updated_at
        FROM users
        WHERE role = $1 AND is_active = true AND deleted_at IS NULL
        ORDER BY last_name, first_name
      `;

      const result = await this.pool.query(query, [role]);
      const users = result.rows.map(row => this.mapRowToUser(row));

      return Result.ok(users);
    } catch (error) {
      console.error("Error finding users by role:", error);
      return Result.fail("Failed to find users by role");
    }
  }

  async save(user: User): Promise<Result<void>> {
    try {
      // Check if user exists
      const existsQuery = "SELECT id FROM users WHERE id = $1";
      const existsResult = await this.pool.query(existsQuery, [user.id]);

      if (existsResult.rows.length > 0) {
        // Update existing user
        const updateQuery = `
          UPDATE users
          SET email = $2,
              password_hash = $3,
              first_name = $4,
              last_name = $5,
              role = $6,
              is_active = $7,
              vk_id = $8,
              avatar_url = $9,
              two_factor_enabled = $10,
              updated_at = NOW()
          WHERE id = $1
        `;

        await this.pool.query(updateQuery, [
          user.id,
          user.email.value,
          user.password.hash,
          user.firstName,
          user.lastName,
          user.role,
          user.isActive,
          user.vkId || null,
          user.avatarUrl || null,
          user.twoFactorEnabled ?? false,
        ]);
      } else {
        // Insert new user
        const insertQuery = `
          INSERT INTO users (id, email, password_hash, first_name, last_name, role, is_active, vk_id, avatar_url, two_factor_enabled, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
        `;

        await this.pool.query(insertQuery, [
          user.id,
          user.email.value,
          user.password.hash,
          user.firstName,
          user.lastName,
          user.role,
          user.isActive,
          user.vkId || null,
          user.avatarUrl || null,
          user.twoFactorEnabled ?? false,
          user.createdAt,
          user.updatedAt,
        ]);
      }

      return Result.ok();
    } catch (error) {
      console.error("Error saving user:", error);
      return Result.fail("Failed to save user");
    }
  }

  async findAll(filter?: UserFilter): Promise<Result<PaginatedUsers>> {
    try {
      const conditions: string[] = ["deleted_at IS NULL"];
      const params: any[] = [];
      let paramIndex = 1;

      if (filter?.role) {
        conditions.push(`role = $${paramIndex++}`);
        params.push(filter.role);
      }

      if (filter?.isActive !== undefined) {
        conditions.push(`is_active = $${paramIndex++}`);
        params.push(filter.isActive);
      }

      if (filter?.search) {
        conditions.push(`(first_name ILIKE $${paramIndex} OR last_name ILIKE $${paramIndex} OR email ILIKE $${paramIndex})`);
        params.push(`%${filter.search}%`);
        paramIndex++;
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

      // Count total
      const countQuery = `SELECT COUNT(*) as count FROM users ${whereClause}`;
      const countResult = await this.pool.query(countQuery, params);
      const total = parseInt(countResult.rows[0].count, 10);

      const page = Math.max(1, filter?.page || 1);
      const limit = Math.max(1, filter?.limit || 20);
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (page - 1) * limit;

      const dataQuery = `
        SELECT id, email, password_hash, first_name, last_name, role, group_name,
               is_active, vk_id, avatar_url, two_factor_enabled, created_at, updated_at
        FROM users
        ${whereClause}
        ORDER BY created_at DESC
        LIMIT $${paramIndex++} OFFSET $${paramIndex++}
      `;
      params.push(limit, offset);

      const dataResult = await this.pool.query(dataQuery, params);
      const users = dataResult.rows.map((row) => this.mapRowToUser(row));

      return Result.ok({
        users,
        total,
        page,
        limit,
        totalPages,
      });
    } catch (error) {
      console.error("Error finding all users:", error);
      return Result.fail("Failed to find users");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const query = `
        UPDATE users
        SET deleted_at = NOW(), is_active = false, updated_at = NOW()
        WHERE id = $1
      `;
      await this.pool.query(query, [id]);
      return Result.ok();
    } catch (error) {
      console.error("Error soft-deleting user:", error);
      return Result.fail("Failed to delete user");
    }
  }

  async countByRole(): Promise<Result<Record<Role, number>>> {
    try {
      const query = `
        SELECT role, COUNT(*) as count
        FROM users
        WHERE deleted_at IS NULL AND is_active = true
        GROUP BY role
      `;
      const result = await this.pool.query(query);
      const counts: Record<Role, number> = {
        STUDENT: 0,
        TEACHER: 0,
        ADMIN: 0,
        SUPERADMIN: 0,
      };
      for (const row of result.rows) {
        if (row.role in counts) {
          counts[row.role as Role] = parseInt(row.count, 10);
        }
      }
      return Result.ok(counts);
    } catch (error) {
      console.error("Error counting users by role:", error);
      return Result.fail("Failed to count users by role");
    }
  }

  /**
   * Map database row to User entity
   * Reconstructs value objects (Email, Password) from stored data
   */
  private mapRowToUser(row: any): User {
    const emailResult = Email.create(row.email);
    if (emailResult.isFailure) {
      throw new Error(`Invalid email in database: ${row.email}`);
    }

    const password = Password.fromHash(row.password_hash);

    return new User(
      row.id,
      emailResult.value,
      password,
      row.first_name,
      row.last_name,
      row.role as Role,
      new Date(row.created_at),
      new Date(row.updated_at),
      row.is_active,
      row.vk_id,
      row.avatar_url,
      row.two_factor_enabled ?? false,
      row.deleted_at ? new Date(row.deleted_at) : undefined,
      row.group_name || undefined
    );
  }
}
