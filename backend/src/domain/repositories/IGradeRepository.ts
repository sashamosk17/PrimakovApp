import { Grade } from "../entities/Grade";
import { SubjectGradeSummary } from "../entities/SubjectGradeSummary";

export interface IGradeRepository {
  findByStudentAndPeriod(studentId: string, period?: string): Promise<Grade[]>;
  saveBatch(grades: Grade[]): Promise<void>;
  getStudentSummary(studentId: string, period?: string): Promise<SubjectGradeSummary[]>;
}

