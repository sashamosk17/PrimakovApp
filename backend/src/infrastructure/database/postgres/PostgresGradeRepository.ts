import { Pool } from "pg";
import { Grade } from "../../../domain/entities/Grade";
import { SubjectGradeSummary } from "../../../domain/entities/SubjectGradeSummary";
import { IGradeRepository } from "../../../domain/repositories/IGradeRepository";

export class PostgresGradeRepository implements IGradeRepository {
  constructor(private readonly pool: Pool) {}

  async findByStudentAndPeriod(studentId: string, period?: string): Promise<Grade[]> {
    let query = `
      SELECT id, student_id, subject_id, subject_name, value, weight, date, period, topic
      FROM grades
      WHERE student_id = $1
    `;
    const params: any[] = [studentId];

    if (period) {
      query += ` AND period = $2`;
      params.push(period);
    }
    query += ` ORDER BY date DESC`;

    const res = await this.pool.query(query, params);
    return res.rows.map(this.mapRowToGrade);
  }

  async saveBatch(grades: Grade[]): Promise<void> {
    if (grades.length === 0) return;

    const client = await this.pool.connect();
    try {
      await client.query("BEGIN");
      const insertQuery = `
        INSERT INTO grades (id, student_id, subject_id, subject_name, value, weight, date, period, topic)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
          value = EXCLUDED.value,
          weight = EXCLUDED.weight,
          topic = EXCLUDED.topic
      `;

      for (const g of grades) {
        await client.query(insertQuery, [
          g.id,
          g.studentId,
          g.subjectId,
          g.subjectName,
          g.value,
          g.weight,
          g.date,
          g.period,
          g.topic || null,
        ]);
      }
      await client.query("COMMIT");
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  }

  async getStudentSummary(studentId: string, period?: string): Promise<SubjectGradeSummary[]> {
    const grades = await this.findByStudentAndPeriod(studentId, period);

    const grouped = new Map<string, Grade[]>();
    for (const grade of grades) {
      const current = grouped.get(grade.subjectName) || [];
      current.push(grade);
      grouped.set(grade.subjectName, current);
    }

    const summaries: SubjectGradeSummary[] = [];
    for (const [subjectName, list] of grouped.entries()) {
      summaries.push(new SubjectGradeSummary(subjectName, list));
    }

    return summaries;
  }

  private mapRowToGrade(row: any): Grade {
    return new Grade(
      row.id,
      row.student_id,
      row.subject_id,
      row.subject_name,
      parseFloat(row.value),
      parseFloat(row.weight),
      new Date(row.date).toISOString(),
      row.period,
      row.topic || undefined
    );
  }
}

