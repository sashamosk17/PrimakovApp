import { Pool } from "pg";
import { ISubjectRepository, TeacherAssignment } from "../../../domain/repositories/ISubjectRepository";
import { Subject } from "../../../domain/entities/Subject";
import { Result } from "../../../shared/Result";

export class PostgresSubjectRepository implements ISubjectRepository {
  constructor(private readonly pool: Pool) {}

  async findAll(): Promise<Result<Subject[]>> {
    try {
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM subjects
        ORDER BY name ASC
      `;
      const res = await this.pool.query(query);
      const subjects = res.rows.map(
        (r) =>
          new Subject(
            r.id,
            r.name,
            r.description,
            new Date(r.created_at),
            new Date(r.updated_at)
          )
      );
      return Result.ok(subjects);
    } catch (error) {
      console.error("Error finding all subjects:", error);
      return Result.fail("Failed to fetch subjects");
    }
  }

  async findById(id: string): Promise<Subject | undefined> {
    try {
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM subjects
        WHERE id = $1
      `;
      const res = await this.pool.query(query, [id]);
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return new Subject(
        r.id,
        r.name,
        r.description,
        new Date(r.created_at),
        new Date(r.updated_at)
      );
    } catch (error) {
      console.error("Error finding subject by id:", error);
      return undefined;
    }
  }

  async findByName(name: string): Promise<Subject | undefined> {
    try {
      const query = `
        SELECT id, name, description, created_at, updated_at
        FROM subjects
        WHERE LOWER(name) = LOWER($1)
        LIMIT 1
      `;
      const res = await this.pool.query(query, [name.trim()]);
      if (res.rows.length === 0) return undefined;
      const r = res.rows[0];
      return new Subject(
        r.id,
        r.name,
        r.description,
        new Date(r.created_at),
        new Date(r.updated_at)
      );
    } catch (error) {
      console.error("Error finding subject by name:", error);
      return undefined;
    }
  }

  async create(subject: Subject): Promise<Result<Subject>> {
    try {
      const existing = await this.findByName(subject.name);
      if (existing) {
        return Result.fail(`Subject with name '${subject.name}' already exists`);
      }

      const query = `
        INSERT INTO subjects (id, name, description, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING id, name, description, created_at, updated_at
      `;
      const res = await this.pool.query(query, [
        subject.id,
        subject.name.trim(),
        subject.description || null,
        subject.createdAt,
        subject.updatedAt,
      ]);
      const r = res.rows[0];
      return Result.ok(
        new Subject(
          r.id,
          r.name,
          r.description,
          new Date(r.created_at),
          new Date(r.updated_at)
        )
      );
    } catch (error: any) {
      console.error("Error creating subject:", error);
      return Result.fail(error.message || "Failed to create subject");
    }
  }

  async delete(id: string): Promise<Result<void>> {
    try {
      const query = `DELETE FROM subjects WHERE id = $1`;
      await this.pool.query(query, [id]);
      return Result.ok();
    } catch (error: any) {
      console.error("Error deleting subject:", error);
      return Result.fail(error.message || "Failed to delete subject");
    }
  }

  async getTeacherSubjects(teacherId: string): Promise<Result<Subject[]>> {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(teacherId);
      if (!isUUID) {
        return Result.ok([]);
      }

      const query = `
        SELECT s.id, s.name, s.description, s.created_at, s.updated_at
        FROM subjects s
        JOIN teacher_subjects ts ON ts.subject_id = s.id
        WHERE ts.teacher_id = $1
        ORDER BY s.name ASC
      `;
      const res = await this.pool.query(query, [teacherId]);
      const subjects = res.rows.map(
        (r) =>
          new Subject(
            r.id,
            r.name,
            r.description,
            new Date(r.created_at),
            new Date(r.updated_at)
          )
      );
      return Result.ok(subjects);
    } catch (error) {
      console.error("Error getting teacher subjects:", error);
      return Result.fail("Failed to get teacher subjects");
    }
  }

  async assignTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>> {
    try {
      const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUUID(teacherId) || !isUUID(subjectId)) {
        return Result.fail("Invalid UUID format for teacher or subject ID");
      }

      const query = `
        INSERT INTO teacher_subjects (teacher_id, subject_id, created_at)
        VALUES ($1, $2, NOW())
        ON CONFLICT (teacher_id, subject_id) DO NOTHING
      `;
      await this.pool.query(query, [teacherId, subjectId]);
      return Result.ok();
    } catch (error: any) {
      console.error("Error assigning teacher subject:", error);
      return Result.fail(error.message || "Failed to assign teacher subject");
    }
  }

  async removeTeacherSubject(teacherId: string, subjectId: string): Promise<Result<void>> {
    try {
      const isUUID = (id: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
      if (!isUUID(teacherId) || !isUUID(subjectId)) {
        return Result.ok();
      }

      const query = `
        DELETE FROM teacher_subjects
        WHERE teacher_id = $1 AND subject_id = $2
      `;
      await this.pool.query(query, [teacherId, subjectId]);
      return Result.ok();
    } catch (error: any) {
      console.error("Error removing teacher subject:", error);
      return Result.fail(error.message || "Failed to remove teacher subject");
    }
  }

  async getAllAssignments(): Promise<Result<TeacherAssignment[]>> {
    try {
      const query = `
        SELECT ts.teacher_id, ts.subject_id, ts.created_at,
               s.name as subject_name,
               CONCAT(u.first_name, ' ', u.last_name) as teacher_name
        FROM teacher_subjects ts
        JOIN subjects s ON s.id = ts.subject_id
        LEFT JOIN users u ON u.id = ts.teacher_id
        ORDER BY s.name ASC
      `;
      const res = await this.pool.query(query);
      const assignments: TeacherAssignment[] = res.rows.map((r) => ({
        teacherId: r.teacher_id,
        subjectId: r.subject_id,
        createdAt: new Date(r.created_at),
        teacherName: r.teacher_name,
        subjectName: r.subject_name,
      }));
      return Result.ok(assignments);
    } catch (error) {
      console.error("Error getting all assignments:", error);
      return Result.fail("Failed to get teacher assignments");
    }
  }
}

