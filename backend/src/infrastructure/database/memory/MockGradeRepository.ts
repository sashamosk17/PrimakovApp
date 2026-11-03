import { Grade } from "../../../domain/entities/Grade";
import { SubjectGradeSummary } from "../../../domain/entities/SubjectGradeSummary";
import { IGradeRepository } from "../../../domain/repositories/IGradeRepository";

export class MockGradeRepository implements IGradeRepository {
  private grades: Grade[] = [];

  async findByStudentAndPeriod(studentId: string, period?: string): Promise<Grade[]> {
    return this.grades.filter(
      (g) => g.studentId === studentId && (!period || g.period === period)
    );
  }

  async saveBatch(grades: Grade[]): Promise<void> {
    this.grades.push(...grades);
  }

  async getStudentSummary(studentId: string, period?: string): Promise<SubjectGradeSummary[]> {
    const studentGrades = await this.findByStudentAndPeriod(studentId, period);

    const grouped = new Map<string, Grade[]>();
    for (const grade of studentGrades) {
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

  // Helper for tests
  clear(): void {
    this.grades = [];
  }
}

